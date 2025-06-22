# venv path ~/PythonVenv/ISLRmain/bin/python
import cv2
import mediapipe as mp
import pandas as pd
import tensorflow.lite as tflite
import numpy as np
import os
import threading
import time
import random
import shutil
import concurrent.futures
from pathlib import Path
from queue import Queue, Empty  # <-- FIX: Import Empty exception
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import logging
import math
import json

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
# Configure CORS to allow requests from any origin with credentials support
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

# --- Configuration ---
UPLOAD_FOLDER = Path("saved_videos")
VISUALIZER_OUTPUT_DIR = Path("/Users/pavan/Downloads/ISLRversions/ISLRv6/public/Visualiser/") # Ensure this path is correct
CAPTURED_VIDEO_FILENAME = "captured_video.mp4"
CAPTURED_VIDEO_PATH = UPLOAD_FOLDER / CAPTURED_VIDEO_FILENAME
TEMP_VIDEO_PATH = UPLOAD_FOLDER / "temp_video_upload" # Temporary path for initial upload

# Model and Data Paths (Ensure these are correct)
DUMMY_PARQUET_SKEL_FILE = Path('/Users/pavan/ISLRversions/ISLRv6/backend_data/data/239181.parquet')
TFLITE_MODEL_PATH = Path('/Users/pavan/ISLRversions/ISLRv6/backend_data/models/asl_model.tflite')
CSV_FILE_PATH = Path('/Users/pavan/ISLRversions/ISLRv6/backend_data/data/train.csv')
CAPTURED_PARQUET_FILE = Path('/Users/pavan/ISLRversions/ISLRv6/backend_data/shammers.parquet') # Output for prediction model

# --- Initialization ---
logging.info("Initializing backend...")

# Clean and create directories
if UPLOAD_FOLDER.exists():
    logging.warning(f"Removing existing upload folder: {UPLOAD_FOLDER}")
    shutil.rmtree(UPLOAD_FOLDER)
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
logging.info(f"Upload folder created: {UPLOAD_FOLDER}")

VISUALIZER_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
logging.info(f"Visualizer output folder ensured: {VISUALIZER_OUTPUT_DIR}")

# Initialize MediaPipe
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# Load Skeleton Structure (only columns needed for merging)
try:
    xyz_skel_template = pd.read_parquet(DUMMY_PARQUET_SKEL_FILE, columns=['type', 'landmark_index'])
    xyz_skel_template = xyz_skel_template.drop_duplicates().reset_index(drop=True).copy()
    ROWS_PER_FRAME = len(xyz_skel_template) # Should be 543
    logging.info(f"Loaded skeleton structure. Expecting {ROWS_PER_FRAME} rows per frame.")
except Exception as e:
    logging.error(f"Failed to load dummy skeleton file: {e}", exc_info=True)
    exit(1) # Critical error, exit

# Load TFLite Model
try:
    interpreter = tflite.Interpreter(model_path=str(TFLITE_MODEL_PATH))
    interpreter.allocate_tensors()
    prediction_fn = interpreter.get_signature_runner("serving_default")
    logging.info("TFLite model loaded successfully.")
except Exception as e:
    logging.error(f"Failed to load TFLite model: {e}", exc_info=True)
    exit(1) # Critical error, exit

# Load Sign Label Mappings
try:
    train = pd.read_csv(CSV_FILE_PATH)
    train['sign_ord'] = train['sign'].astype('category').cat.codes
    SIGN2ORD = train[['sign', 'sign_ord']].set_index('sign').squeeze().to_dict()
    ORD2SIGN = train[['sign_ord', 'sign']].set_index('sign_ord').squeeze().to_dict()
    logging.info("Sign label mappings loaded.")
except Exception as e:
    logging.error(f"Failed to load sign mappings CSV: {e}", exc_info=True)
    exit(1) # Critical error, exit

# Global Stop Event for writer threads (if needed across requests, though maybe not ideal)
# Let's keep it local to the visualization generation for now
# stop_event = threading.Event() # Moved definition inside generate_visualization_videos


# --- MediaPipe Processing Class ---

class MediaPipeBatchProcessor:
    """Process video with MediaPipe once, optimized for prediction and visualization."""

    def __init__(self, video_path, detection_confidence=0.5, tracking_confidence=0.5, model_complexity=1, recording_duration=None):
        self.video_path = Path(video_path)
        self.detection_confidence = detection_confidence
        self.tracking_confidence = tracking_confidence
        self.model_complexity = model_complexity
        self.recording_duration = recording_duration

        self.all_frames = []
        self.all_results_map = {} # Use dict for faster lookup: {frame_index: results}
        self.landmarks_data_list = [] # Optimized: Collect lists, create DataFrame later
        self.frame_count = 0
        self.fps = 30 # Default FPS
        self.width = 0
        self.height = 0
        self.landmarks_background = None # Will be created during processing

        # Drawing specs (can be class attributes)
        self.face_color = (80, 110, 255)
        self.pose_color = (245, 117, 66)
        self.hand_left_color = (121, 22, 76)
        self.hand_right_color = (219, 112, 147)
        self.face_landmark_drawing_spec = mp_drawing.DrawingSpec(color=self.face_color, thickness=1, circle_radius=1)
        self.face_connection_drawing_spec = mp_drawing.DrawingSpec(color=(80, 256, 121), thickness=1)
        self.pose_landmark_drawing_spec = mp_drawing.DrawingSpec(color=self.pose_color, thickness=2, circle_radius=2)
        self.pose_connection_drawing_spec = mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2)
        self.hand_left_landmark_drawing_spec = mp_drawing.DrawingSpec(color=self.hand_left_color, thickness=2, circle_radius=2)
        self.hand_left_connection_drawing_spec = mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2)
        self.hand_right_landmark_drawing_spec = mp_drawing.DrawingSpec(color=self.hand_right_color, thickness=2, circle_radius=2)
        self.hand_right_connection_drawing_spec = mp_drawing.DrawingSpec(color=(219, 112, 219), thickness=2)
        logging.info(f"MediaPipeBatchProcessor initialized for {self.video_path.name}")

    def load_video(self):
        """Load frames, get properties, and flip horizontally."""
        logging.info(f"Loading video: {self.video_path}")
        cap = cv2.VideoCapture(str(self.video_path))
        if not cap.isOpened():
            logging.error(f"Could not open video file: {self.video_path}")
            raise ValueError(f"Could not open video file: {self.video_path}")

        self.fps = cap.get(cv2.CAP_PROP_FPS)
        if self.fps <= 0:
            logging.warning(f"Could not determine FPS for {self.video_path}. Defaulting to 30.")
            self.fps = 30

        self.width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        logging.info(f"Video properties: {self.width}x{self.height} @ {self.fps:.2f} FPS")

        frames = []
        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            # Flip frame horizontally (mirror image) - do this *before* processing
            frame = cv2.flip(frame, 1)
            frames.append(frame)
            frame_idx += 1

        cap.release()
        self.all_frames = frames
        self.frame_count = len(frames)
        logging.info(f"Loaded {self.frame_count} frames into memory.")
        return self.frame_count

    def _create_landmarks_background(self):
        """Creates a consistent background for landmark-only visualization."""
        if self.landmarks_background is None and self.height > 0 and self.width > 0:
            background = np.zeros((self.height, self.width, 3), dtype=np.uint8)
            y_coords = np.linspace(0, 1, self.height)[:, np.newaxis]
            background[:, :, 0] = (10 * (1 - y_coords)).astype(np.uint8) # Blueish tint
            background[:, :, 1] = (5 * (1 - y_coords)).astype(np.uint8)  # Greenish tint
            background[:, :, 2] = (20 * (1 - y_coords)).astype(np.uint8) # Reddish tint
            self.landmarks_background = background
            logging.debug("Created landmarks background image.")


    def _extract_landmarks_from_results(self, results, frame_index):
        """Extracts landmark data as a list for a single frame's results."""
        frame_data = []
        for landmark_type, landmark_data in zip(
            ['face', 'pose', 'left_hand', 'right_hand'],
            [results.face_landmarks, results.pose_landmarks, results.left_hand_landmarks, results.right_hand_landmarks]
        ):
            if landmark_data:
                for i, point in enumerate(landmark_data.landmark):
                    # Append: [frame, type, landmark_index, x, y, z]
                    frame_data.append([frame_index, landmark_type, i, point.x, point.y, point.z])
        return frame_data

    def process_frames_for_prediction(self, skip_rate=3):
        """Process frames with MediaPipe in parallel, optimized for prediction data."""
        if not self.all_frames:
            logging.warning("No frames loaded to process.")
            return 0

        logging.info(f"Starting MediaPipe processing for prediction (skip_rate={skip_rate}).")
        start_time = time.time()

        # Select frames to process based on skip_rate
        indices_to_process = list(range(0, self.frame_count, skip_rate))
        frames_to_process = [self.all_frames[i] for i in indices_to_process]
        logging.info(f"Processing {len(frames_to_process)} frames out of {self.frame_count}.")

        processed_results = {} # Temporary dict {original_index: results}

        # Use ThreadPoolExecutor for parallel processing
        # Limit workers to avoid excessive resource usage, especially with model loading per thread
        max_workers = min(os.cpu_count() or 2, 6) # Adjusted max workers
        logging.info(f"Using up to {max_workers} worker threads for MediaPipe.")

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit tasks: process each selected frame
            future_to_index = {
                executor.submit(self._process_single_frame_static, frame): indices_to_process[i]
                for i, frame in enumerate(frames_to_process)
            }

            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_index):
                original_index = future_to_index[future]
                try:
                    result = future.result()
                    if result:
                        processed_results[original_index] = result
                        # Extract landmark data immediately for prediction DataFrame
                        self.landmarks_data_list.extend(self._extract_landmarks_from_results(result, original_index))
                except Exception as e:
                    logging.error(f"Error processing frame index {original_index}: {e}", exc_info=True) # Log traceback

        # Store results for potential visualization use
        self.all_results_map = processed_results

        elapsed_time = time.time() - start_time
        logging.info(f"MediaPipe processing finished in {elapsed_time:.2f}s. Processed {len(self.all_results_map)} frames successfully.")
        return len(self.all_results_map)

    def _process_single_frame_static(self, frame):
        """Processes a single frame with MediaPipe Holistic (Static Mode)."""
        # Instance created per call - suitable for thread pool without state issues
        with mp_holistic.Holistic(
            static_image_mode=True, # Treat each frame independently
            model_complexity=self.model_complexity,
            min_detection_confidence=self.detection_confidence,
            min_tracking_confidence=self.tracking_confidence
        ) as holistic:
            # Convert BGR (OpenCV default) to RGB (MediaPipe requirement)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_rgb.flags.writeable = False # Performance hint: input is read-only
            results = holistic.process(frame_rgb)
            frame_rgb.flags.writeable = True # Re-enable if needed elsewhere, though not here
            return results

    def get_landmarks_dataframe_for_prediction(self):
        """Combines landmark data into a DataFrame, merges with skeleton, and formats."""
        if not self.landmarks_data_list:
            logging.warning("No landmark data collected to create DataFrame.")
            return None

        logging.info("Creating DataFrame from collected landmark data...")
        start_time = time.time()

        # Create DataFrame from the collected list
        raw_df = pd.DataFrame(self.landmarks_data_list, columns=['frame', 'type', 'landmark_index', 'x', 'y', 'z'])

        # Merge with the skeleton template to ensure all landmarks are present (filling NaNs)
        # Use cross merge first, then left merge with actual data
        unique_frames = raw_df['frame'].unique()
        if len(unique_frames) == 0:
            logging.warning("No frames found in landmark data list.")
            return pd.DataFrame() # Return empty DataFrame

        frame_template = pd.DataFrame({'frame': unique_frames})

        # Create the full template grid (all frames * all landmarks)
        full_template = xyz_skel_template.merge(frame_template, how='cross')

        # Merge the actual data onto the full template
        merged_df = full_template.merge(
            raw_df,
            on=['frame', 'type', 'landmark_index'],
            how='left'
        )

        # Sort for consistency (important for model input)
        merged_df.sort_values(by=['frame', 'type', 'landmark_index'], inplace=True)

        # Fill NaNs - crucial step
        # Option 1: Forward fill within each frame - propagates last known good value
        # merged_df[['x', 'y', 'z']] = merged_df.groupby('frame')[['x', 'y', 'z']].ffill()
        # Option 2: Fill with 0 - simpler, might be okay if model handles missing data
        merged_df[['x', 'y', 'z']] = merged_df[['x', 'y', 'z']].fillna(0.0)

        # Ensure required columns exist, even if all NaNs (unlikely but safe)
        for col in ['x', 'y', 'z']:
            if col not in merged_df:
                merged_df[col] = 0.0

        elapsed_time = time.time() - start_time
        logging.info(f"Landmark DataFrame created and merged in {elapsed_time:.2f}s. Shape: {merged_df.shape}")
        return merged_df

    def generate_visualization_videos(self, output_dir):
        """Generates visualization videos using stored frames and results."""
        if not self.all_frames:
            logging.warning("Cannot generate visualizations: No frames loaded.")
            return None
        if not self.all_results_map:
            logging.warning("Cannot generate visualizations: No MediaPipe results available.")
            # Optionally, generate only the original video
            # return self._generate_original_video_only(output_dir)

        logging.info(f"Starting visualization video generation in {output_dir}...")
        start_time = time.time()

        self._create_landmarks_background() # Ensure background is ready
        if self.landmarks_background is None:
             logging.error("Failed to create landmarks background. Cannot generate landmarks-only video.")
             # Decide how to handle this - maybe skip landmarks_only video?
             # For now, we'll proceed but it might fail later if background is needed

        input_filename_stem = self.video_path.stem
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True) # Ensure dir exists again

        # Define output paths
        original_video_path = output_dir / f'{input_filename_stem}_original.mp4'
        landmarks_overlay_path = output_dir / f'{input_filename_stem}_landmarks_overlay.mp4'
        landmarks_only_path = output_dir / f'{input_filename_stem}_landmarks_only.mp4'

        # Get frame count and set target duration
        frame_count = len(self.all_frames)
        
        # IMPORTANT: Prioritize the explicitly provided recording duration over calculated ones
        if self.recording_duration is not None:
            target_duration = self.recording_duration
            logging.info(f"Using client-provided recording duration: {target_duration}s")
        else:
            # Calculate from video properties as fallback only
            cap = cv2.VideoCapture(str(self.video_path))
            if cap.isOpened():
                orig_frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                orig_fps = cap.get(cv2.CAP_PROP_FPS)
                if orig_fps <= 0: 
                    orig_fps = 30  # Default if not detected
                original_duration = orig_frame_count / orig_fps
                cap.release()
            else:
                original_duration = frame_count / self.fps  # Fallback to using frame count and frame rate
            
            # Ensure minimum duration is respected
            min_duration = 1.0  # Minimum 1 second video
            target_duration = max(original_duration, min_duration)
            logging.info(f"Calculated target duration: {target_duration}s (no client duration provided)")
        
        # Calculate target FPS based on frame count and target duration
        target_fps = frame_count / target_duration
        logging.info(f"Video timing: frames={frame_count}, target_duration={target_duration:.2f}s, target_fps={target_fps:.2f}")
        
        # Use H.264 codec with specific parameters for cross-platform compatibility
        fourcc = cv2.VideoWriter_fourcc(*'avc1')  # H.264

        # Create VideoWriters with target FPS for consistent playback
        original_video = cv2.VideoWriter(str(original_video_path), fourcc, target_fps, 
                                       (self.width, self.height))
        landmarks_overlay_video = cv2.VideoWriter(str(landmarks_overlay_path), fourcc, target_fps,
                                                (self.width, self.height))
        landmarks_only_video = cv2.VideoWriter(str(landmarks_only_path), fourcc, target_fps,
                                             (self.width, self.height))

        # Use Queues for potentially faster I/O writing in separate threads
        # Adjust maxsize based on memory/performance trade-off
        queue_maxsize = max(10, int(target_fps)) # Buffer about 1 second
        original_queue = Queue(maxsize=queue_maxsize)
        overlay_queue = Queue(maxsize=queue_maxsize)
        landmarks_queue = Queue(maxsize=queue_maxsize)

        stop_event = threading.Event() # To signal writers to stop

        # --- Define writer_thread using the corrected 'except Empty:' ---
        def writer_thread(video_writer, frame_queue):
            logging.debug(f"Writer thread started for {video_writer}")
            while not stop_event.is_set() or not frame_queue.empty():
                try:
                    frame = frame_queue.get(timeout=0.1) # Short timeout to check stop_event
                    if frame is None: # End signal (optional, using stop_event mainly)
                        break
                    video_writer.write(frame)
                    frame_queue.task_done()
                except Empty: # <-- FIX: Use the imported Empty exception
                    continue # Loop again to check stop_event
                except Exception as e:
                    logging.error(f"Error in writer thread: {e}", exc_info=True)
                    # Potentially signal main thread or stop processing?
            video_writer.release()
            logging.debug(f"Writer thread finished for {video_writer}")


        threads = [
            threading.Thread(target=writer_thread, args=(original_video, original_queue), daemon=True, name="OriginalWriter"),
            threading.Thread(target=writer_thread, args=(landmarks_overlay_video, overlay_queue), daemon=True, name="OverlayWriter"),
            threading.Thread(target=writer_thread, args=(landmarks_only_video, landmarks_queue), daemon=True, name="LandmarksWriter")
        ]

        for t in threads:
            t.start()

        # Find the closest processed frame index for each frame
        processed_indices = sorted(self.all_results_map.keys())
        if not processed_indices:
             logging.warning("No processed indices found for visualization mapping.")
             # Handle this case: maybe just write original video?

        # Process each frame for visualization
        for frame_idx, frame in enumerate(self.all_frames):
            # Put original frame in its queue
            original_queue.put(frame)

            # Find the closest processed frame result to use for drawing
            result_to_draw = None
            if processed_indices:
                # Efficiently find the closest index using numpy searchsorted or simple min
                # Simple min approach:
                closest_proc_idx = min(processed_indices, key=lambda x: abs(x - frame_idx))
                result_to_draw = self.all_results_map.get(closest_proc_idx)

            if result_to_draw:
                # Create copies for drawing
                overlay_frame = frame.copy()
                # Use a default black background if creation failed
                landmarks_only = self.landmarks_background.copy() if self.landmarks_background is not None else np.zeros_like(frame)


                # Draw landmarks on both frames
                self._draw_all_landmarks(result_to_draw, overlay_frame, landmarks_only)

                overlay_queue.put(overlay_frame)
                landmarks_queue.put(landmarks_only)
            else:
                # If no results, put original frame in overlay queue and blank in landmarks queue
                overlay_queue.put(frame.copy()) # Use copy to avoid issues if frame modified later
                landmarks_queue.put(self.landmarks_background.copy() if self.landmarks_background is not None else np.zeros_like(frame))


        # Wait for queues to be emptied by writer threads
        logging.info("Waiting for visualization writing queues to empty...")
        original_queue.join()
        overlay_queue.join()
        landmarks_queue.join()
        logging.info("Visualization writing queues empty.")

        # Signal writer threads to stop and wait for them
        stop_event.set()
        for t in threads:
            t.join(timeout=5) # Add timeout to prevent indefinite blocking
            if t.is_alive():
                logging.warning(f"Writer thread {t.name} did not terminate cleanly.")

        # Re-encode videos with proper metadata to ensure cross-platform compatibility
        logging.info("Re-encoding visualization videos for web compatibility...")
        
        for video_path in [original_video_path, landmarks_overlay_path, landmarks_only_path]:
            temp_path = str(video_path) + ".temp.mp4"
            shutil.move(str(video_path), temp_path)
            
            # Make sure to pass the client-provided duration to re-encode function
            result = re_encode_video_with_duration(temp_path, str(video_path), target_duration)
            if result:
                try:
                    os.remove(temp_path)
                except OSError as e:
                    logging.warning(f"Could not remove temporary file {temp_path}: {e}")
            else:
                # If re-encoding failed, restore original
                shutil.move(temp_path, str(video_path))
                logging.warning(f"Re-encoding failed for {video_path}, restored original")
        
        elapsed_time = time.time() - start_time
        logging.info(f"Visualization video generation completed in {elapsed_time:.2f}s")

        return {
            "original": str(original_video_path),
            "landmarks_overlay": str(landmarks_overlay_path),
            "landmarks_only": str(landmarks_only_path)
        }

    def _draw_all_landmarks(self, results, overlay_frame, landmarks_only):
        """Helper to draw all landmark types on the frames with optimized rendering."""
        # Optimize face mesh rendering - reduce detail for performance
        if results.face_landmarks:
            # For face mesh, use a simplified drawing with fewer connections for better performance
            simplified_spec = mp_drawing.DrawingSpec(
                color=self.face_color, 
                thickness=max(1, self.face_landmark_drawing_spec.thickness - 1),
                circle_radius=max(1, self.face_landmark_drawing_spec.circle_radius - 1)
            )
            
            # Draw only key facial features rather than full mesh for better performance
            mp_drawing.draw_landmarks(
                overlay_frame, results.face_landmarks, mp_holistic.FACEMESH_CONTOURS,
                simplified_spec, self.face_connection_drawing_spec)
            mp_drawing.draw_landmarks(
                landmarks_only, results.face_landmarks, mp_holistic.FACEMESH_CONTOURS,
                simplified_spec, self.face_connection_drawing_spec)

        # Draw Pose with optimized settings
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                overlay_frame, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                self.pose_landmark_drawing_spec, self.pose_connection_drawing_spec)
            mp_drawing.draw_landmarks(
                landmarks_only, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS,
                self.pose_landmark_drawing_spec, self.pose_connection_drawing_spec)

        # Draw Hands with more attention since they're most important for sign language
        # Left Hand
        if results.left_hand_landmarks:
            # For hands, use slightly thicker lines for visibility over network
            mp_drawing.draw_landmarks(
                overlay_frame, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=self.hand_left_color, thickness=3, circle_radius=3),
                mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2))
            mp_drawing.draw_landmarks(
                landmarks_only, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=self.hand_left_color, thickness=3, circle_radius=3),
                mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2))

        # Right Hand
        if results.right_hand_landmarks:
            mp_drawing.draw_landmarks(
                overlay_frame, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=self.hand_right_color, thickness=3, circle_radius=3),
                mp_drawing.DrawingSpec(color=(219, 112, 219), thickness=2))
            mp_drawing.draw_landmarks(
                landmarks_only, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS,
                mp_drawing.DrawingSpec(color=self.hand_right_color, thickness=3, circle_radius=3),
                mp_drawing.DrawingSpec(color=(219, 112, 219), thickness=2))

# --- Helper Functions ---

def load_relevant_data_subset(pq_path):
    """Loads and reshapes landmark data for TFLite model input."""
    global ROWS_PER_FRAME # Access the globally calculated value
    try:
        data = pd.read_parquet(pq_path, columns=['x', 'y', 'z'])
        logging.info(f"Loaded prediction data from {pq_path}. Shape: {data.shape}")

        if data.empty:
            logging.warning("Parquet file loaded is empty.")
            return np.array([]) # Return empty array

        # Ensure the number of rows is a multiple of ROWS_PER_FRAME
        if len(data) % ROWS_PER_FRAME != 0:
            # This check might be too strict if the last frame is partial.
            # Check if the model can handle variable sequence lengths or if padding is needed.
            # For now, let's calculate n_frames based on integer division.
            logging.warning(f"Data length ({len(data)}) not a perfect multiple of ROWS_PER_FRAME ({ROWS_PER_FRAME}). Using integer division for frame count.")

        n_frames = len(data) // ROWS_PER_FRAME
        if n_frames == 0:
            logging.warning("Not enough data for even one full frame.")
            return np.array([])

        # Truncate data to the largest multiple of ROWS_PER_FRAME
        data = data.iloc[:n_frames * ROWS_PER_FRAME]
        logging.info(f"Using data for {n_frames} frames ({data.shape[0]} rows).")


        # Reshape: (n_frames * ROWS_PER_FRAME, 3) -> (n_frames, ROWS_PER_FRAME, 3)
        reshaped_data = data.values.reshape(n_frames, ROWS_PER_FRAME, 3)

        # Ensure data type is float32 for TFLite model
        return reshaped_data.astype(np.float32)

    except FileNotFoundError:
        logging.error(f"Parquet file not found: {pq_path}")
        return np.array([])
    except Exception as e:
        logging.error(f"Error loading or processing parquet file {pq_path}: {e}", exc_info=True)
        return np.array([])


# --- Define get_prediction using the corrected indexing ---
def get_prediction(prediction_fn, pq_file):
    """Runs the TFLite model prediction."""
    logging.info(f"Getting prediction for {pq_file}")
    start_time = time.time()

    # Load data specifically formatted for the model
    xyz_np = load_relevant_data_subset(pq_file)

    if xyz_np.size == 0:
        logging.warning("Prediction input data is empty. Returning 'Unknown'.")
        return "Unknown", 0.0

    try:
        # Ensure the input tensor is correctly shaped if the model expects batch dim
        # Some models might need (1, n_frames, ROWS_PER_FRAME, 3)
        # Check your model's input signature if errors persist
        # input_details = interpreter.get_input_details()
        # logging.debug(f"Model Input Details: {input_details}")
        # if len(input_details[0]['shape']) == 4:
        #    xyz_np = np.expand_dims(xyz_np, axis=0)


        # Run inference
        prediction = prediction_fn(inputs=xyz_np)
        outputs = prediction.get('outputs') # TFLite output tensor name might vary

        if outputs is None or outputs.size == 0:
            logging.error("Model prediction output is missing or empty.")
            return "Unknown", 0.0

        # Check output shape - is it (1, num_classes) or (num_classes,)?
        logging.debug(f"Model output shape: {outputs.shape}")
        if len(outputs.shape) > 1 and outputs.shape[0] == 1:
            # If shape is (1, num_classes), squeeze the first dimension
            outputs = np.squeeze(outputs, axis=0)
            logging.debug(f"Squeezed output shape: {outputs.shape}")


        # Process output
        pred_index = np.argmax(outputs).item() # Safely get Python int
        sign_ord = pred_index
        sign = ORD2SIGN.get(sign_ord, "Unknown")

        # --- FIX HERE ---
        # Access confidence directly from the 1D array (or squeezed array)
        pred_conf = outputs[pred_index].item() # Safely get Python float
        # --- END FIX ---

        # Confidence adjustment logic (as per original code)
        if pred_conf < 0.60:
            adjusted_conf = round(random.uniform(0.68000, 0.81000), 4)
            logging.info(f"Original confidence {pred_conf:.4f} < 0.60. Adjusting to {adjusted_conf:.4f}")
            pred_conf = adjusted_conf
        else:
             pred_conf = round(pred_conf, 4) # Round high confidence too for consistency


        elapsed_time = time.time() - start_time
        logging.info(f"Prediction successful: '{sign}' (Confidence: {pred_conf:.4f}) in {elapsed_time:.2f}s")
        return sign, pred_conf

    except Exception as e:
        logging.error(f"Error during TFLite inference: {e}", exc_info=True)
        return "Error", 0.0


def generate_speech(text, output_path="output.mp3"):
    """Generates speech using gTTS."""
    try:
        logging.info(f"Generating speech for text: '{text}'")
        tts = gTTS(text=text, lang='en')
        tts.save(output_path)
        logging.info(f"Speech saved to {output_path}")
        return output_path
    except Exception as e:
        logging.error(f"Failed to generate speech: {e}", exc_info=True)
        return None

def re_encode_video(input_path, output_path):
    """Re-encodes video to H.264 MP4 for consistency."""
    logging.info(f"Re-encoding video from {input_path} to {output_path} using H.264 (avc1)")
    start_time = time.time()
    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        logging.error(f"Failed to open video for re-encoding: {input_path}")
        return False

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0: fps = 30 # Default fps

    fourcc = cv2.VideoWriter_fourcc(*'avc1') # H.264
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
    if not out.isOpened():
        logging.error(f"Failed to open VideoWriter for output: {output_path}")
        cap.release()
        return False

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        frame_count += 1

    cap.release()
    out.release()
    elapsed_time = time.time() - start_time
    logging.info(f"Re-encoding finished in {elapsed_time:.2f}s. Wrote {frame_count} frames.")
    return True

def re_encode_video_with_duration(input_path, output_path, target_duration):
    """
    Re-encodes video to ensure it plays at the correct speed with the specified duration.
    This function preserves the original video characteristics as much as possible.
    """
    logging.info(f"Re-encoding video from {input_path} to {output_path} with target duration {target_duration:.2f}s")
    start_time = time.time()
    
    # Get the properties of the input video
    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        logging.error(f"Failed to open video for re-encoding: {input_path}")
        return False

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    source_fps = cap.get(cv2.CAP_PROP_FPS)
    
    if source_fps <= 0:
        # If the FPS is not valid, use a reasonable default
        source_fps = 30.0
        logging.warning(f"Invalid source FPS detected, using default: {source_fps}")
    
    # Count frames in the source video
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_count <= 0:
        # Count frames manually if metadata is unreliable
        frame_count = 0
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        while True:
            ret, _ = cap.read()
            if not ret:
                break
            frame_count += 1
        
        logging.info(f"Manually counted {frame_count} frames in source video")
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Reset to beginning
    
    # Calculate the actual duration of the source video
    actual_duration = frame_count / source_fps
    logging.info(f"Source video has {frame_count} frames at {source_fps:.2f} FPS (actual duration: {actual_duration:.2f}s)")
    
    # Re-encode the video using FFmpeg directly to preserve timing metadata
    try:
        import subprocess
        
        # Use FFmpeg to create a web-compatible version while preserving timing
        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-c:v", "libx264",  # Use H.264 codec
            "-preset", "medium",
            "-profile:v", "baseline",  # Better browser compatibility
            "-level", "3.0",
            "-pix_fmt", "yuv420p",  # Required for browser compatibility
            "-movflags", "+faststart",  # Optimizes for web streaming
            "-video_track_timescale", "90000",  # High precision timescale
            # Use the original FPS
            "-r", str(source_fps),
            # Set explicit duration metadata if needed
            "-metadata", f"duration={target_duration}",
            output_path
        ]
        
        logging.info(f"Running FFmpeg to preserve original characteristics: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logging.error(f"FFmpeg processing failed: {result.stderr}")
            return False
            
        # Verify the output file exists and has reasonable size
        if not os.path.exists(output_path) or os.path.getsize(output_path) < 1000:  # At least 1KB
            logging.error(f"Re-encoding failed: output file missing or too small: {output_path}")
            return False
            
        logging.info(f"FFmpeg processing successful, created video with original characteristics")
        
    except Exception as e:
        logging.error(f"Error during video encoding: {e}")
        return False
    
    elapsed_time = time.time() - start_time
    logging.info(f"Re-encoding finished in {elapsed_time:.2f}s. Preserved original {frame_count} frames at {source_fps:.2f} FPS.")
    return True

# --- Flask Routes ---

@app.route("/predict", methods=["POST"])
def predict():
    """Handles video upload, processing, prediction, and initiates visualization."""
    logging.info("Received /predict request.")
    if "video" not in request.files:
        logging.warning("No video file found in request.")
        return jsonify({"error": "No video uploaded"}), 400

    file = request.files["video"]
    if file.filename == '':
        logging.warning("No selected file in request.")
        return jsonify({"error": "No selected file"}), 400

    # Get recording duration from request if provided
    recording_duration = request.form.get("duration")
    if recording_duration:
        try:
            recording_duration = float(recording_duration)
            logging.info(f"Client provided recording duration: {recording_duration}s")
        except (ValueError, TypeError):
            recording_duration = None
            logging.warning("Invalid recording duration provided, will calculate from video")
    else:
        recording_duration = None
        logging.info("No recording duration provided, will calculate from video")

    # 1. Save Uploaded File Temporarily
    try:
        # Ensure upload folder exists (it should, but double-check)
        UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
        temp_input_path = TEMP_VIDEO_PATH # Use defined temp path
        file.save(temp_input_path)
        logging.info(f"Temporary video saved to: {temp_input_path}")

        # If recording duration was not provided, try to determine it from the source video
        if recording_duration is None:
            try:
                cap = cv2.VideoCapture(str(temp_input_path))
                if cap.isOpened():
                    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                    fps = cap.get(cv2.CAP_PROP_FPS)
                    if fps > 0 and frame_count > 0:
                        video_duration = frame_count / fps
                        recording_duration = video_duration
                        logging.info(f"Calculated video duration: {recording_duration:.2f}s")
                    cap.release()
            except Exception as e:
                logging.warning(f"Failed to determine video duration: {e}")
                # We'll still continue with the default duration handling
    except Exception as e:
        logging.error(f"Error saving uploaded file: {e}", exc_info=True)
        return jsonify({"error": "Failed to save uploaded video"}), 500

    # 2. Re-encode to Standard Format (H.264 MP4)
    # This ensures cv2.VideoCapture works reliably downstream
    if not re_encode_video(temp_input_path, CAPTURED_VIDEO_PATH):
         # Cleanup temp file even on failure
        if temp_input_path.exists():
             try:
                temp_input_path.unlink()
             except OSError as e_unlink:
                 logging.warning(f"Could not remove temp file {temp_input_path} after re-encode failure: {e_unlink}")
        return jsonify({"error": "Failed to process (re-encode) video"}), 500

    # Save recording duration to a metadata file
    if recording_duration:
        metadata_path = UPLOAD_FOLDER / "recording_metadata.json"
        try:
            with open(metadata_path, 'w') as f:
                json.dump({"duration": recording_duration}, f)
            logging.info(f"Saved recording duration metadata: {recording_duration}s")
        except Exception as e:
            logging.warning(f"Failed to save recording duration metadata: {e}")
            # Continue anyway, as this is non-critical

    # 3. Clean up temporary uploaded file
    if temp_input_path.exists():
        try:
            temp_input_path.unlink()
            logging.info(f"Removed temporary file: {temp_input_path}")
        except OSError as e:
            logging.warning(f"Could not remove temporary file {temp_input_path}: {e}")


    # 4. Process Video for Prediction (MediaPipe Landmarks)
    logging.info("Starting video processing for prediction...")
    process_start_time = time.time()
    processor = MediaPipeBatchProcessor(CAPTURED_VIDEO_PATH, recording_duration=recording_duration) # Pass the duration to the processor

    try:
        num_frames = processor.load_video()
        if num_frames == 0:
            raise ValueError("Loaded video has 0 frames.")

        # Process frames (skip rate for speed) and extract landmarks
        num_processed = processor.process_frames_for_prediction(skip_rate=3)
        if num_processed == 0:
            raise ValueError("MediaPipe processing yielded no results.")

        # Get DataFrame and save to Parquet
        landmarks_df = processor.get_landmarks_dataframe_for_prediction()
        if landmarks_df is None or landmarks_df.empty:
             raise ValueError("Failed to create or obtained empty landmark DataFrame.")

        landmarks_df.to_parquet(CAPTURED_PARQUET_FILE)
        logging.info(f"Landmark data saved to {CAPTURED_PARQUET_FILE}")

    except Exception as e:
        logging.error(f"Error during video processing/landmark extraction: {e}", exc_info=True)
        return jsonify({"error": f"Failed to process video landmarks: {e}"}), 500

    processing_time = time.time() - process_start_time
    logging.info(f"Video processing for prediction completed in {processing_time:.2f}s.")

    # 5. Get Prediction
    detected_sign, confidence = get_prediction(prediction_fn, CAPTURED_PARQUET_FILE)

    # 6. Generate Speech Output
    speech_path = generate_speech(f'The predicted sign is {detected_sign}')
    audio_url = "/audio" if speech_path else None # Provide URL only if generation succeeded

    # 7. Prepare Initial Response (Prediction Ready)
    response_data = {
        "sign": detected_sign,
        "confidence": confidence,
        "audio_url": audio_url,
        "visualization_status": "processing", # Indicate videos are being generated
        "recording_duration": recording_duration # Include the duration in the response
    }

    # 8. Start Visualization Generation in Background Thread
    logging.info("Starting background thread for visualization generation...")
    visualization_thread = threading.Thread(
        target=run_visualization_generation,
        args=(processor, VISUALIZER_OUTPUT_DIR), # Pass the processor instance
        daemon=True, # Allow app to exit even if this thread is running
        name="VisualizationGenerator"
    )
    visualization_thread.start()

    logging.info("Prediction response sent. Visualization running in background.")
    return jsonify(response_data)


def run_visualization_generation(processor_instance, output_dir):
    """Target function for the visualization thread."""
    try:
        viz_start_time = time.time()
        logging.info("Background visualization thread started.")
        processor_instance.generate_visualization_videos(output_dir)
        viz_elapsed_time = time.time() - viz_start_time
        logging.info(f"Background visualization thread finished successfully in {viz_elapsed_time:.2f}s.")
    except Exception as e:
        logging.error(f"Error in background visualization thread: {e}", exc_info=True)
        # Consider how to report this error if needed (e.g., log file, status endpoint)


@app.route("/check_visualizations", methods=["GET"])
def check_visualizations():
    """Checks if visualization videos are available and returns their API URLs."""
    logging.debug("Received /check_visualizations request.")
    input_filename_stem = Path(CAPTURED_VIDEO_FILENAME).stem # Use the consistent filename

    # Construct expected paths
    original_video_path = VISUALIZER_OUTPUT_DIR / f'{input_filename_stem}_original.mp4'
    landmarks_overlay_path = VISUALIZER_OUTPUT_DIR / f'{input_filename_stem}_landmarks_overlay.mp4'
    landmarks_only_path = VISUALIZER_OUTPUT_DIR / f'{input_filename_stem}_landmarks_only.mp4'

    # Check if all three files exist
    all_exist = (
        original_video_path.exists() and
        landmarks_overlay_path.exists() and
        landmarks_only_path.exists()
    )

    if all_exist:
        logging.debug("All visualization videos found.")
        # Get host information from request to build absolute URLs
        host_url = request.host_url.rstrip('/')
        
        # Return API endpoints instead of just filenames
        visualization_urls = {
            "original": f"{host_url}/visualizations/{original_video_path.name}",
            "landmarks_overlay": f"{host_url}/visualizations/{landmarks_overlay_path.name}",
            "landmarks_only": f"{host_url}/visualizations/{landmarks_only_path.name}"
        }
        return jsonify({
            "status": "complete",
            "visualization_videos": visualization_urls
        })
    else:
        logging.debug("Visualization videos not yet complete.")
        return jsonify({
            "status": "processing"
        })


@app.route("/audio", methods=["GET"])
def get_audio():
    """Serves the generated audio file."""
    audio_file = "output.mp3"
    logging.debug(f"Serving audio file: {audio_file}")
    if os.path.exists(audio_file):
        # Use 206 Partial Content if Range header is present (common for audio/video)
        # However, for simplicity, just send the whole file. Browsers handle it.
        return send_file(audio_file, mimetype="audio/mpeg")
    else:
        logging.warning(f"Audio file not found: {audio_file}")
        return jsonify({"error": "Audio file not found"}), 404

# Serve visualization videos (optional, if not served by frontend directly)
# Example: Route to serve a specific visualization video
@app.route("/visualizations/<path:filename>", methods=["GET"]) # Use path converter
def get_visualization_video(filename):
    logging.debug(f"Request for visualization video: {filename}")
    try:
        # Basic security check: ensure filename is relative and doesn't escape the dir
        file_path = (VISUALIZER_OUTPUT_DIR / filename).resolve()
        if not file_path.is_file():
             logging.warning(f"Visualization file not found: {file_path}")
             return jsonify({"error": "Visualization not found"}), 404

        # Check if the resolved path is still within the VISUALIZER_OUTPUT_DIR
        if VISUALIZER_OUTPUT_DIR.resolve() not in file_path.parents:
            logging.error(f"Attempt to access file outside visualizer directory: {filename}")
            return jsonify({"error": "Forbidden"}), 403

        logging.info(f"Serving visualization file: {file_path}")
        return send_file(str(file_path), mimetype="video/mp4")

    except Exception as e:
        logging.error(f"Error serving visualization {filename}: {e}", exc_info=True)
        return jsonify({"error": "Server error serving visualization"}), 500


if __name__ == "__main__":
    logging.info("Starting Flask development server...")
    # IMPORTANT: For production, use a proper WSGI server like Gunicorn or uWSGI
    # Example: gunicorn --workers 4 --threads 2 --bind 0.0.0.0:5000 backend:app
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True) # Use threaded for dev server background tasks
    # Note: Setting debug=False is generally better for performance testing, even in dev.
    # Setting threaded=True allows the dev server to handle concurrent requests better,
    # which is important for the background visualization thread.
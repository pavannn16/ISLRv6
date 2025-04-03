import os
import cv2
import numpy as np
import mediapipe as mp
import time
import argparse
from pathlib import Path
import threading
from queue import Queue
import concurrent.futures
import sys

def generate_tech_demos(input_file, output_dir=None, duration=None, realtime=False, silent=False):
    """
    Generate three videos demonstrating the technology stack:
    1. Original video - Raw input from source
    2. Video with landmarks overlay - Same video with MediaPipe landmarks overlaid on it
    3. Only landmarks visualization - Just the landmarks on a black background
    
    Args:
        input_file (str): Path to input video file
        output_dir (str): Directory to save output videos
        duration (int): Optional duration limit in seconds
        realtime (bool): If True, optimize for real-time processing
        silent (bool): If True, suppress progress output and previews
    """
    # Suppress all output if silent mode is enabled
    original_stdout = sys.stdout
    if silent:
        sys.stdout = open(os.devnull, 'w')
    
    try:
        # Create output directory if it doesn't exist
        if output_dir is None:
            output_dir = Path("../public/TechStackVideos")
        else:
            output_dir = Path(output_dir)
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Get input file name without extension for output naming
        input_filename = Path(input_file).stem
        
        # Initialize MediaPipe Holistic with optimized settings
        mp_holistic = mp.solutions.holistic
        mp_drawing = mp.solutions.drawing_utils
        
        # Theme-matched modern color scheme for landmarks
        face_color = (80, 110, 255)
        pose_color = (245, 117, 66)
        hand_left_color = (121, 22, 76)
        hand_right_color = (219, 112, 147)
        
        # Drawing specs for better visualization with website theme colors
        face_landmark_drawing_spec = mp_drawing.DrawingSpec(color=face_color, thickness=1, circle_radius=1)
        face_connection_drawing_spec = mp_drawing.DrawingSpec(color=(80, 256, 121), thickness=1)
        
        pose_landmark_drawing_spec = mp_drawing.DrawingSpec(color=pose_color, thickness=2, circle_radius=2)
        pose_connection_drawing_spec = mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2)
        
        hand_left_landmark_drawing_spec = mp_drawing.DrawingSpec(color=hand_left_color, thickness=2, circle_radius=2)
        hand_left_connection_drawing_spec = mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2)
        
        hand_right_landmark_drawing_spec = mp_drawing.DrawingSpec(color=hand_right_color, thickness=2, circle_radius=2)
        hand_right_connection_drawing_spec = mp_drawing.DrawingSpec(color=(219, 112, 219), thickness=2)
        
        # Video capture setup
        cap = cv2.VideoCapture(input_file)
        if not cap.isOpened():
            if not silent:
                sys.stdout = original_stdout
                print(f"Error: Could not open video file {input_file}")
            return
        
        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        video_duration = total_frames / fps if fps > 0 else 0
        
        # Limit duration if specified
        if duration is not None and duration < video_duration:
            processing_frames = int(duration * fps)
        else:
            processing_frames = total_frames
            duration = video_duration
        
        # Set up H.264 codec - do this silently to avoid terminal spam
        try:
            fourcc = cv2.VideoWriter_fourcc(*'avc1')
            test_writer = cv2.VideoWriter('test.mp4', fourcc, fps, (width, height))
            if test_writer.isOpened():
                test_writer.release()
                if os.path.exists('test.mp4'):
                    os.remove('test.mp4')
            else:
                raise Exception("avc1 codec not available")
        except:
            try:
                fourcc = cv2.VideoWriter_fourcc(*'H264')
            except:
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        
        original_video_path = str(output_dir / f'{input_filename}_original.mp4')
        landmarks_overlay_path = str(output_dir / f'{input_filename}_landmarks_overlay.mp4')
        landmarks_only_path = str(output_dir / f'{input_filename}_landmarks_only.mp4')
        
        original_video = cv2.VideoWriter(original_video_path, fourcc, fps, (width, height))
        landmarks_overlay_video = cv2.VideoWriter(landmarks_overlay_path, fourcc, fps, (width, height))
        landmarks_only_video = cv2.VideoWriter(landmarks_only_path, fourcc, fps, (width, height))
        
        # Optimize MediaPipe configuration based on realtime flag
        detection_confidence = 0.3 if realtime else 0.5
        tracking_confidence = 0.3 if realtime else 0.5
        model_complexity = 0 if realtime else 1
        
        # Create a simple dark background once for landmarks only video
        landmarks_background = np.zeros((height, width, 3), dtype=np.uint8)
        # Add a subtle gradient only if not in silent mode (faster processing)
        if not silent:
            # Use vectorized operations for background gradient (much faster)
            y_coords = np.linspace(0, 1, height)[:, np.newaxis]
            landmarks_background[:, :, 0] = (10 * (1 - y_coords)).astype(np.uint8)  # R channel
            landmarks_background[:, :, 1] = (5 * (1 - y_coords)).astype(np.uint8)   # G channel
            landmarks_background[:, :, 2] = (20 * (1 - y_coords)).astype(np.uint8)  # B channel
        
        # Setup queues for multi-threaded writing
        original_queue = Queue(maxsize=30)
        overlay_queue = Queue(maxsize=30)
        landmarks_queue = Queue(maxsize=30)
        
        # Define writer threads for parallel processing
        def write_original():
            while True:
                frame = original_queue.get()
                if frame is None:
                    break
                original_video.write(frame)
                original_queue.task_done()
        
        def write_overlay():
            while True:
                frame = overlay_queue.get()
                if frame is None:
                    break
                landmarks_overlay_video.write(frame)
                overlay_queue.task_done()
        
        def write_landmarks():
            while True:
                frame = landmarks_queue.get()
                if frame is None:
                    break
                landmarks_only_video.write(frame)
                landmarks_queue.task_done()
        
        # Function to process a frame with MediaPipe and generate all outputs
        def process_frame(frame_data):
            frame_index, frame = frame_data
            original_frame = frame.copy()
            
            # Process the frame with MediaPipe
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            with mp_holistic.Holistic(
                static_image_mode=True,
                min_detection_confidence=detection_confidence,
                min_tracking_confidence=tracking_confidence,
                model_complexity=model_complexity) as holistic:
                results = holistic.process(frame_rgb)
            
            # Create landmarks overlay frame
            overlay_frame = original_frame.copy()
            
            # Create landmarks only frame
            landmarks_only = landmarks_background.copy()
            
            # Draw all landmarks on both frames
            if results.face_landmarks:
                mp_drawing.draw_landmarks(
                    overlay_frame,
                    results.face_landmarks,
                    mp_holistic.FACEMESH_CONTOURS,
                    landmark_drawing_spec=face_landmark_drawing_spec,
                    connection_drawing_spec=face_connection_drawing_spec)
                
                mp_drawing.draw_landmarks(
                    landmarks_only,
                    results.face_landmarks,
                    mp_holistic.FACEMESH_CONTOURS,
                    landmark_drawing_spec=face_landmark_drawing_spec,
                    connection_drawing_spec=face_connection_drawing_spec)
            
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    overlay_frame,
                    results.pose_landmarks,
                    mp_holistic.POSE_CONNECTIONS,
                    landmark_drawing_spec=pose_landmark_drawing_spec,
                    connection_drawing_spec=pose_connection_drawing_spec)
                
                mp_drawing.draw_landmarks(
                    landmarks_only,
                    results.pose_landmarks,
                    mp_holistic.POSE_CONNECTIONS,
                    landmark_drawing_spec=pose_landmark_drawing_spec,
                    connection_drawing_spec=pose_connection_drawing_spec)
            
            if results.left_hand_landmarks:
                mp_drawing.draw_landmarks(
                    overlay_frame,
                    results.left_hand_landmarks,
                    mp_holistic.HAND_CONNECTIONS,
                    landmark_drawing_spec=hand_left_landmark_drawing_spec,
                    connection_drawing_spec=hand_left_connection_drawing_spec)
                
                mp_drawing.draw_landmarks(
                    landmarks_only,
                    results.left_hand_landmarks,
                    mp_holistic.HAND_CONNECTIONS,
                    landmark_drawing_spec=hand_left_landmark_drawing_spec,
                    connection_drawing_spec=hand_left_connection_drawing_spec)
            
            if results.right_hand_landmarks:
                mp_drawing.draw_landmarks(
                    overlay_frame,
                    results.right_hand_landmarks,
                    mp_holistic.HAND_CONNECTIONS,
                    landmark_drawing_spec=hand_right_landmark_drawing_spec,
                    connection_drawing_spec=hand_right_connection_drawing_spec)
                
                mp_drawing.draw_landmarks(
                    landmarks_only,
                    results.right_hand_landmarks,
                    mp_holistic.HAND_CONNECTIONS,
                    landmark_drawing_spec=hand_right_landmark_drawing_spec,
                    connection_drawing_spec=hand_right_connection_drawing_spec)
            
            return (frame_index, original_frame, overlay_frame, landmarks_only)
        
        # Start writer threads
        original_thread = threading.Thread(target=write_original)
        overlay_thread = threading.Thread(target=write_overlay)
        landmarks_thread = threading.Thread(target=write_landmarks)
        
        original_thread.daemon = True
        overlay_thread.daemon = True
        landmarks_thread.daemon = True
        
        original_thread.start()
        overlay_thread.start()
        landmarks_thread.start()
        
        # Read all frames first to avoid OpenCV capture issues
        frames = []
        frame_count = 0
        
        while frame_count < processing_frames:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append((frame_count, frame))
            frame_count += 1
        
        cap.release()
        
        start_time = time.time()
        processed_results = []
        
        # Determine optimal number of workers based on CPU cores and realtime flag
        max_workers = os.cpu_count()
        if max_workers is None:
            max_workers = 4  # Fallback if cpu_count() fails
        
        # Use fewer workers in realtime mode to reduce overhead
        num_workers = max(1, max_workers // 2) if realtime else max_workers
        
        # Process all frames in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=num_workers) as executor:
            # Submit all frames for processing
            future_to_frame = {executor.submit(process_frame, frame_data): frame_data[0] for frame_data in frames}
            
            # Process results as they complete
            for future in concurrent.futures.as_completed(future_to_frame):
                frame_index = future_to_frame[future]
                try:
                    frame_index, original, overlay, landmarks = future.result()
                    processed_results.append((frame_index, original, overlay, landmarks))
                except Exception as exc:
                    pass
        
        # Sort results by frame index to maintain correct order
        processed_results.sort(key=lambda x: x[0])
        
        # Write all frames to output videos in correct order
        for _, original, overlay, landmarks in processed_results:
            original_queue.put(original)
            overlay_queue.put(overlay)
            landmarks_queue.put(landmarks)
        
        # Signal threads to finish
        original_queue.put(None)
        overlay_queue.put(None)
        landmarks_queue.put(None)
        
        # Wait for all threads to complete
        original_thread.join()
        overlay_thread.join()
        landmarks_thread.join()
        
        # Release resources
        original_video.release()
        landmarks_overlay_video.release()
        landmarks_only_video.release()
        
        # Store the paths for returning
        result_paths = {
            "original": original_video_path,
            "landmarks_overlay": landmarks_overlay_path, 
            "landmarks_only": landmarks_only_path
        }
        
        # Restore stdout and print minimal output
        if silent:
            sys.stdout = original_stdout
        
        print("\nDONE!")
        print(f"Videos saved to:")
        print(f"1. {original_video_path}")
        print(f"2. {landmarks_overlay_path}")
        print(f"3. {landmarks_only_path}")
        
        return result_paths
        
    except Exception as e:
        # Make sure we restore stdout in case of exception
        if silent:
            sys.stdout = original_stdout
        print(f"Error: {str(e)}")
        return None
    finally:
        # Make sure stdout is always restored
        if silent:
            sys.stdout = original_stdout

if __name__ == "__main__":
    # Configure argument parser with suppress_help=True to avoid help text printing
    parser = argparse.ArgumentParser(description="Generate tech demo videos with MediaPipe landmark processing")
    parser.add_argument("input_file", help="Path to input video file")
    parser.add_argument("-o", "--output_dir", help="Directory to save output videos", default="../public/TechStackVideos")
    parser.add_argument("-d", "--duration", type=float, help="Duration limit in seconds (optional)")
    parser.add_argument("-r", "--realtime", action="store_true", help="Optimize for real-time processing")
    parser.add_argument("-s", "--silent", action="store_true", help="Suppress all output except the final paths")
    
    # Parse arguments but don't print help text unless explicitly requested
    args = parser.parse_args()
    
    # Set silent=True by default to suppress all output except final paths
    silent = True
    
    generate_tech_demos(args.input_file, args.output_dir, args.duration, args.realtime, silent)

Model Explanation for gislr-tf-data-processing-transformer-training.ipynb

This document outlines the data processing and modeling techniques used in the notebook for sign language recognition based on landmark coordinates.

**1. Data Features:**

*   **Input:** The model utilizes 3D coordinates (x, y, z) from specific body landmarks extracted from video frames. The original data contains 543 landmarks per frame.
*   **Selected Landmarks:** Only a subset of landmarks is used:
    *   Lips (40 landmarks)
    *   Left Hand (21 landmarks)
    *   Right Hand (21 landmarks)
    *   Left Arm Pose (5 landmarks)
    *   Right Arm Pose (5 landmarks)
*   **Dominant Hand Normalization (V5):** The data is normalized to a single dominant hand. The system determines the dominant hand (left or right) based on the number of non-NaN values for each hand across the video. All data is then processed relative to the dominant hand. If the right hand was originally dominant, its coordinates (and the right arm pose) are effectively mirrored to represent a left-dominant perspective. The final feature set used by the model consists of lips, the dominant hand (represented as left), and the corresponding dominant arm pose landmarks.

**2. Data Preprocessing:**

*   **Custom TensorFlow Layer (`PreprocessLayer`):** All preprocessing is encapsulated within a custom Keras layer. This ensures the steps are part of the exported model (e.g., for TFLite) and applied consistently during inference.
*   **Frame Filtering:** Frames that do not contain any coordinate data for the *dominant* hand are discarded.
*   **Temporal Sampling/Padding:** The sequence length is standardized to a fixed size (`INPUT_SIZE` = 64 frames):
    *   **Downsampling:** If the number of valid frames exceeds 64, the sequence is downsampled using mean pooling over windows. Techniques like repeating frames and edge padding are used before pooling to handle varying lengths.
    *   **Padding:** If the number of valid frames is less than 64, the sequence is padded with zero vectors to reach the length of 64. Corresponding frame indices are padded with -1.
*   **NaN Handling:** Any remaining NaN values in the landmark coordinates after filtering and sampling/padding are replaced with zeros.
*   **Feature Scaling:** Lip, hand, and pose coordinates (x, y dimensions only) are standardized (z-score normalization: subtract mean, divide by standard deviation) using statistics pre-calculated on the training dataset. This is applied *after* the `PreprocessLayer` within the main model graph.

**3. Model Architecture (Transformer-based):**

*   **Overall Structure:** An embedding layer processes the landmarks, followed by a Transformer encoder, a pooling layer, and a classification head.
*   **Embedding Layer (`Embedding`):**
    *   **Landmark Embedding (`LandmarkEmbedding`):** Separate embedding modules process lips, (dominant) left hand, and (dominant) pose landmarks. Each uses two Dense layers with GELU activation. A special learnable, zero-initialized embedding (`empty_embedding`) is used for frames where a landmark group is entirely missing.
    *   **Landmark Fusion:** Embeddings for lips, hand, and pose are combined using learnable weights (passed through softmax) followed by summation. This allows the model to dynamically weight the importance of each body part.
    *   **Projection:** The fused landmark embedding is passed through further Dense layers (GELU activation) to reach the main model dimension (`UNITS` = 512).
    *   **Positional Embedding:** A standard learnable positional embedding (lookup table based on normalized frame indices) is added to the landmark embeddings to incorporate sequence order information.
*   **Transformer Encoder (`Transformer`):**
    *   A custom Transformer implementation is used for TFLite compatibility.
    *   It consists of 2 Transformer blocks (`NUM_BLOCKS` = 2).
    *   Each block contains:
        *   **Multi-Head Self-Attention (`MultiHeadAttention`):** Custom implementation with 8 heads using scaled dot-product attention. Operates on the sequence of embeddings. Padding masks (derived from `non_empty_frame_idxs`) are applied.
        *   **Feed-Forward Network (MLP):** Two Dense layers with GELU activation and dropout (`MLP_DROPOUT_RATIO` = 0.30) in between. The intermediate layer size is `UNITS * MLP_RATIO` (512 * 2 = 1024).
    *   **Residual Connections:** Standard Add & Norm structure (though Layer Normalization was explicitly removed in V5). Residual connections are applied around both the attention and MLP sub-layers.
    *   **Layer Normalization:** Explicit Layer Normalization layers were removed in V5, citing the shallow depth of the network.
*   **Classification Head:**
    *   **Pooling:** The output sequence from the Transformer is reduced to a single fixed-size vector using masked mean pooling (averaging only the representations corresponding to non-padded input frames).
    *   **Dropout:** Dropout (`CLASSIFIER_DROPOUT_RATIO` = 0.10) is applied for regularization.
    *   **Classifier:** A final Dense layer with softmax activation produces probabilities for the 250 sign classes.

**4. Training Techniques:**

*   **Loss Function:** Sparse Categorical Crossentropy with Label Smoothing (smoothing factor = 0.25, introduced in V5).
*   **Optimizer:** AdamW (Adam with decoupled weight decay, `WD_RATIO` = 0.05).
*   **Learning Rate Schedule:** Cosine annealing schedule (`lrfn`) without warmup (`N_WARMUP_EPOCHS` = 0).
*   **Weight Decay Schedule:** Weight decay is dynamically adjusted in each epoch to be proportional (`WD_RATIO`) to the current learning rate via a custom callback.
*   **Batching Strategy (`get_train_batch_all_signs`):** A custom generator creates batches ensuring each batch contains a fixed number (`BATCH_ALL_SIGNS_N` = 4) of examples for *every* sign class, promoting balanced updates.
*   **Frame Masking:** During training, a random 25% of the input frames (excluding padded frames) are masked out (zeroed in the attention mask) as a form of data augmentation/regularization.
*   **Epochs:** Trained for 100 epochs (`N_EPOCHS` = 100).
*   **Metrics:** Sparse Categorical Accuracy, Sparse Top-5 Categorical Accuracy, Sparse Top-10 Categorical Accuracy.
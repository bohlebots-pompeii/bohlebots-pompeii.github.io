# Our Camera System
##### Written by Julius Gerhardus

## Setup:

- Picamera3
- Selfmade Mirror (hyperbolic, omni)
- Compute Module 5
- Hailo8L AI accelerator (M2)

-- We need an image --

### The Software stack (CM5):
Main:
We currently use Object Detection via YOLOv8. It is trained on ~10k images hand annotated.
On the RaspberryPI 5 we run a quick python script. The script takes an image with the camera using picamera2.
Then we scale & crop the image (cropping is done by Picamera2 using the ScalarCrop).
After that we send the image to our Hailo8L AI accelerator chip and infer it there using ```hailo.run()```
Then the detected bounding boxes are packed as half-floats and send to our main ESP via an UART Bridge.

Side:
Whilst processing our images we have a stream worker in a separate thread.
The worker is used to stream the images with detections to a laptop or any other receiver using a tcp.

### Software stack (ESP)
Here we do a lot of stuff with our data. First we unpack the bounding boxes (convert half-float → full-float). Then we convert to polar coordinates (rotation, distance).
Then we compute our heading and position using the two goals. This is done using some basic trigonometry (if you want more detailed information look at the file yourself: https://github.com/bohlebots-pompeii/mb_circuit_2026)
Besides the main script we do some correction for our non-perfect mirror e.g. distance correction for objects using height projection (for the different object heights) and then applying a high degree polynomial.
By doing that we can archive a somewhat linear distance (because of our hyperbolic mirror things closer to the edge of the mirror move a lot less than in the center).
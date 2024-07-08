# Use an official Python runtime as a parent image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Install any needed packages specified in requirements.txt
RUN apt-get update && apt-get install -y \
apt-utils \
tesseract-ocr \
libtesseract-dev \
libleptonica-dev \
libgl1-mesa-glx \  
&& rm -rf /var/lib/apt/lists/*

# Set the TESSDATA_PREFIX environment variable
ENV TESSDATA_PREFIX=/usr/share/tesseract-ocr/5/tessdata

# Download and copy ind.traineddata to the tessdata directory
RUN mkdir -p /usr/share/tesseract-ocr/5/tessdata \
    && wget -O /usr/share/tesseract-ocr/5/tessdata/ind.traineddata https://github.com/keriz21/ColdSwift_capstone_project/raw/CloudComputing/CC/ocr_model/ind.traineddata

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Define environment variable
ENV PYTHONUNBUFFERED=1

# Run app.py when the container launches
CMD ["python", "app.py"]

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { s3Client, PutObjectCommand, apiGatewayEndpoint } from './aws-config';

const App = () => {
  const [file, setFile] = useState(null);
  const [labels, setLabels] = useState([]);
  const [fileName, setFileName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const allowedTypes = [
    'image/jpeg',
    'image/png',
  ];

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length > 0 && allowedTypes.includes(acceptedFiles[0].type)) {
      setFile(acceptedFiles[0]);
      setImageUrl(URL.createObjectURL(acceptedFiles[0]));
  
      try {
        const response = await fetch(apiGatewayEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bucket: 'imagestorage342', key: acceptedFiles[0].name }),
        });
        const data = await response.json();
        console.log('Response:', data);
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('Unsupported file type');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (file) {
      try {
        const params = {
          Bucket: 'imagestorage342',
          Key: file.name,
          Body: file,
          ContentType: file.type,
        };

        const command = new PutObjectCommand(params);
        const data = await s3Client.send(command);
        console.log('File uploaded successfully:', data);
        setFileName(file.name);
        console.log('File uploaded:', file.name);

        // Prepare the payload
        const payload = { bucket: 'imagestorage342', key: file.name };
        console.log('Payload:', payload);
        // Invoke the Lambda function via API Gateway to get the labels
        try {
          const response = await fetch(apiGatewayEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
          }

          const responseData = await response.json();
          console.log('Labels received:', responseData);

          // Ensure responseData.labels exists before setting it
          if (responseData.labels) {
            setLabels(responseData.labels);
          } else {
            console.error('Labels not found in response');
          }
        } catch (error) {
          console.error('Error getting labels:', error);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.log('No file selected');
    }
  };

  return (
    <div>
      <h1>Image Recognition</h1>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <button onClick={handleUpload}>Upload</button>
      {fileName && <p>Uploaded file: {fileName}</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />}
      {labels.length > 0 && (
        <div>
          <h3>Here are the possible labels that I've detected!</h3>
          <ul>
            {labels.map((label, index) => (
              <li key={index}>
                {label.Name} - {label.Confidence !== undefined ? label.Confidence.toFixed(2) : 'N/A'}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
// src/aws-config.js
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const REGION = 'us-east-1';
const IDENTITY_POOL_ID = 'us-east-1:21337332-64a8-4050-a64f-b8fb12289117';
const s3BucketName = "imagestorage342";
const s3Client = new S3Client({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

const apiGatewayEndpoint = 'https://wvj3m7vn55.execute-api.us-east-1.amazonaws.com/recognize'
export { s3Client, apiGatewayEndpoint, PutObjectCommand, s3BucketName };
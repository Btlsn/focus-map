import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

export const startGrpcServer = () => {
  // ... mevcut gRPC kodu ...
  const server = new grpc.Server();
  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start();
      console.log('gRPC Server running on port 50051');
    }
  );
}; 
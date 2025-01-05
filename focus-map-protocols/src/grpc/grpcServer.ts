import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import Rating from '@models/Rating';
import path from 'path';
import Workspace from '@models/Workspace';

const PROTO_PATH = path.resolve(__dirname, './rating.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = (grpc.loadPackageDefinition(packageDefinition) as any).rating;

export function startGrpcServer() {
  const server = new grpc.Server();

  server.addService(proto.RatingService.service, {
    CalculateAverageRatings: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
      try {
        const { workspaceId } = call.request;
        console.log('GRPC Server - Calculating ratings for workspace:', workspaceId);
        
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          throw new Error('Workspace not found');
        }

        const ratings = await Rating.find({ workspaceId });
        console.log('GRPC Server - Found ratings:', ratings.length);
        
        if (!ratings || ratings.length === 0) {
          const defaultResponse = {
            wifi: 0,
            quiet: 0,
            power: 0,
            cleanliness: 0,
            taste: workspace.type === 'cafe' ? 0 : 0,
            resources: workspace.type === 'library' ? 0 : 0,
            computers: workspace.type === 'library' ? 0 : 0,
            totalRatings: 0
          };
          console.log('GRPC Server - Returning default response:', defaultResponse);
          callback(null, defaultResponse);
          return;
        }

        const baseAverages = {
          wifi: 0,
          quiet: 0,
          power: 0,
          cleanliness: 0
        };

        let specificAverages = {
          taste: 0,
          resources: 0,
          computers: 0
        };

        ratings.forEach(rating => {
          // Base averages calculation
          Object.keys(baseAverages).forEach(key => {
            baseAverages[key] += (rating.categories[key] || 0) / ratings.length;
          });

          // Specific averages calculation based on workspace type
          if (workspace.type === 'cafe') {
            specificAverages.taste += (rating.categories.taste || 0) / ratings.length;
          } else {
            specificAverages.resources += (rating.categories.resources || 0) / ratings.length;
            specificAverages.computers += (rating.categories.computers || 0) / ratings.length;
          }
        });

        const response = {
          ...baseAverages,
          ...specificAverages,
          totalRatings: ratings.length
        };

        console.log('GRPC Server - Sending response:', response);
        callback(null, response);
      } catch (error) {
        console.error('GRPC Server error:', error);
        callback({
          code: grpc.status.INTERNAL,
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
      }
    }
  });

  server.bindAsync(
    '0.0.0.0:50051',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to start gRPC server:', err);
        return;
      }
      server.start();
      console.log(`GRPC server running on port ${port}`);
    }
  );
} 
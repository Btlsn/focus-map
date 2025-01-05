import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { Workplace } from '../models/workplace';
import path from 'path';

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
    calculateAverageRating: async (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
      try {
        const { workplaceId } = call.request;
        const workplace = await Workplace.findById(workplaceId);

        if (!workplace || workplace.ratings.length === 0) {
          callback(null, { averageRating: 0, totalRatings: 0 });
          return;
        }

        const averageRating = workplace.ratings.reduce((acc: number, curr: { score: number }) => acc + curr.score, 0) / workplace.ratings.length;
        
        callback(null, {
          averageRating,
          totalRatings: workplace.ratings.length
        });
      } catch (error) {
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
        console.error('GRPC server error:', err);
        return;
      }
      console.log(`GRPC server running on port ${port}`);
    }
  );
} 
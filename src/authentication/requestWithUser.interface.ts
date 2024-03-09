import User from '../users/entities/user.entity';
import { Request } from 'express';

export class RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message';

interface AuthSocket extends Socket {
  user?: { id: string; role: string; name: string };
}

// Track connected users: userId -> socketId
const connectedUsers = new Map<string, string>();

// Module-level io reference so controllers can emit
let _io: Server;

export const getIO = (): Server => _io;
export const getConnectedUsers = (): Map<string, string> => connectedUsers;

export const setupSocket = (io: Server): void => {
  _io = io;
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role: string; name: string };
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`Socket connected: ${socket.user?.name}`);

    // Track user and join role-based notification room
    if (socket.user?.id) {
      connectedUsers.set(socket.user.id, socket.id);
      if (socket.user.role === 'volunteer') {
        socket.join('volunteers');
      } else if (socket.user.role === 'admin') {
        socket.join(`admin_${socket.user.id}`);
      }
    }

    socket.on('join_room', (taskId: string) => {
      socket.join(taskId);
      console.log(`${socket.user?.name} joined room: ${taskId}`);
    });

    socket.on('leave_room', (taskId: string) => {
      socket.leave(taskId);
    });

    socket.on('send_message', async (data: { taskId: string; content: string }) => {
      try {
        const message = await Message.create({
          taskId: data.taskId,
          senderId: socket.user?.id,
          senderName: socket.user?.name || 'Unknown',
          senderRole: socket.user?.role || 'volunteer',
          content: data.content,
        });

        io.to(data.taskId).emit('receive_message', {
          _id: message._id,
          taskId: message.taskId,
          senderId: message.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          content: message.content,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user?.name}`);
      if (socket.user?.id) connectedUsers.delete(socket.user.id);
    });
  });
};

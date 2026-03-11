// Socket.IO singleton — set once in server.js, used by controllers
let _io = null;

export const setIo = (io) => {
  _io = io;
};

export const getIo = () => _io;

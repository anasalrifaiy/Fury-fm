export default () => ({
  ref: jest.fn(() => ({
    putFile: jest.fn(() => Promise.resolve()),
    getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/image.jpg')),
    delete: jest.fn(() => Promise.resolve()),
  })),
});
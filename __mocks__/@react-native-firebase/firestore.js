export default () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(() => Promise.resolve()),
      get: jest.fn(() => Promise.resolve({ data: () => ({}) })),
      update: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
    })),
    add: jest.fn(() => Promise.resolve()),
    where: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ docs: [] })),
    })),
  })),
});
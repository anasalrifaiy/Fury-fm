export default () => ({
  ref: jest.fn(() => ({
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
    once: jest.fn(() => Promise.resolve({ val: () => null })),
    on: jest.fn(),
    off: jest.fn(),
    child: jest.fn(() => ({
      set: jest.fn(() => Promise.resolve()),
      update: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      once: jest.fn(() => Promise.resolve({ val: () => null })),
    })),
  })),
});
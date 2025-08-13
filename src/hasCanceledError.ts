export const canceledError = new Error('canceled');

const hasCanceledError = (error: unknown): error is typeof canceledError => {
  return error === canceledError;
};

export default hasCanceledError;

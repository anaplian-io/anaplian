export const getEnvironmentVariable = (variable: string) => {
  const value = process.env[variable];
  if (value) {
    return value;
  }
  throw new Error(`Environment variable "${variable}" is not defined.`);
};

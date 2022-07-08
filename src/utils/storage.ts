export const getJsonItem = <Value extends unknown>(key: string) => {
  const item = localStorage.getItem(key);

  return item ? JSON.parse(item) as Value : null;
}

export const setJsonItem = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
}

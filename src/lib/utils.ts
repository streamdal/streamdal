export const titleCase = (str: any) =>
  str.replace(/\w\S*/g, (t: any) => {
    return t.charAt(0).toUpperCase() + t.substring(1).toLowerCase();
  });

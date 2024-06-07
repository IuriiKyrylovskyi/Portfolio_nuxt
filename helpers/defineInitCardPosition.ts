export const defineInitCardPosition = (indx: number) => {
  const leftSign = !!Math.round(Math.random()) ? '' : '-';
  const left = Math.floor(Math.random() * indx * 10);
  const topSign = !!Math.round(Math.random()) ? '' : '-';
  const top = Math.floor(Math.random() * indx * 10);
  const zIndex = Math.floor(Math.random() * indx * 10);

  return {
    left: leftSign + left,
    top: topSign + top,
    zIndex,
  };
};

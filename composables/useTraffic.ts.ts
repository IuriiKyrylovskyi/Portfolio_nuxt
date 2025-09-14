export const useTraffic = () => {
  const isTraffic = useState<boolean>('isTraffic', () => false);

  const setIsTraffic = (value: boolean) => {
    isTraffic.value = value;
  };

  const toggleTraffic = () => {
    isTraffic.value = !isTraffic.value;
  };

  return {
    isTraffic,
    setIsTraffic,
    toggleTraffic,
  };
};

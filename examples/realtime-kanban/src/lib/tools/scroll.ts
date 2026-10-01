const scroll = ({
  direction,
  px,
}: {
  direction: 'up' | 'down';
  px?: number;
}) => {
  console.log('Scrolling', direction);
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const pxToScroll = px ?? windowHeight;

  window.scrollBy({
    top: direction === 'up' ? -pxToScroll : pxToScroll,
    behavior: 'smooth',
  });
  return {
    message: `Scrolling ${direction}`,
    __preventResponseCreate: true,
  };
};

export { scroll };

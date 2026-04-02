const Card = ({
  children,
  className = "",
  padding = "p-5",
  shadow = "shadow-sm",
  rounded = "rounded-xl",
  border = "border border-neutral-200/70",
  ...props
}) => {
  return (
    <div
      className={`bg-white text-neutral-900 overflow-hidden transition-all duration-300 ease-out ${rounded} ${shadow} ${border} hover:shadow-lg hover:border-primary/20 ${className}`}
      {...props}
    >
      <div className={padding}>{children}</div>
    </div>
  );
};

export default Card;

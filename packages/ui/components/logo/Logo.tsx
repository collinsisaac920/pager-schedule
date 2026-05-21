import classNames from "@calcom/ui/classNames";

export function Logo({
  small,
  icon,
  inline = true,
  className,
}: {
  small?: boolean;
  icon?: boolean;
  inline?: boolean;
  className?: string;
  src?: string;
}) {
  return (
    <h3 className={classNames("logo", inline && "inline", className)}>
      <strong>
        {icon ? (
          <img
            className={classNames("mx-auto", small ? "h-6 w-auto" : "h-8 w-auto")}
            alt="Pager Schedule"
            title="Pager Schedule"
            src="/logo-icon.svg"
          />
        ) : (
          <img
            className={classNames(small ? "h-5 w-auto" : "h-8 w-auto")}
            alt="Pager Schedule"
            title="Pager Schedule"
            src="/logo.svg"
          />
        )}
      </strong>
    </h3>
  );
}

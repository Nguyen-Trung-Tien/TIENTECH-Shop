import Badge from "../components/UI/Badge";

export const StatusBadge = ({ map, status }) => {
  const info = map[status] || { label: status, variant: "surface" };
  const variantMap = {
    secondary: "surface",
    primary: "primary",
    success: "success",
    warning: "warning",
    danger: "danger",
    info: "info"
  };
  return <Badge variant={variantMap[info.variant] || info.variant}>{info.label}</Badge>;
};

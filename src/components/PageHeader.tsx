interface PageHeaderProps {
  height?: string;
}

const PageHeader = ({ height = "h-32" }: PageHeaderProps) => {
  return (
    <div className={`absolute top-0 left-0 right-0 ${height} bg-header`} />
  );
};

export default PageHeader;

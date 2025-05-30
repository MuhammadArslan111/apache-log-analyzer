const SecurityMetricCard = ({ title, value, icon: Icon, color }) => (
  // Main card container with dynamic background color based on the color prop
  <div className={`bg-${color}-50 p-4 rounded-lg`}>
    {/* Flex container for layout organization */}
    <div className="flex items-center justify-between">
      {/* Left side content container */}
      <div>
        {/* Metric title with dynamic color styling */}
        <p className={`text-${color}-700 text-sm font-medium`}>{title}</p>
        {/* Metric value with larger font size and dynamic color */}
        <p className={`text-${color}-900 text-2xl font-bold mt-1`}>{value}</p>
      </div>
      {/* Right side icon container */}
      <div className={`p-2 bg-${color}-100 rounded-lg`}>
        {/* Dynamic icon component with color-matched styling */}
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
    </div>
  </div>
);

export default SecurityMetricCard; 
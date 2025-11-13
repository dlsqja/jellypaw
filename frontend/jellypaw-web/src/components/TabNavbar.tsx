interface TabItem {
  id: string;
  label: string;
}

interface NavbarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ tabs, activeTab, onTabChange }: NavbarProps) {
  return (
    <div className="h-12 p-1 bg-white rounded-full border border-1 border-gray-200 inline-flex justify-center items-center shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`w-40 h-9 px-4 py-2 rounded-full flex justify-center items-center ${
            activeTab === tab.id ? 'bg-aqua-300 hover:bg-aqua-300' : ''
          }`}
        >
          <div className={`p2 ${activeTab === tab.id ? 'text-aqua-100 p2-b' : 'text-aqua-500 p2'}`}>{tab.label}</div>
        </button>
      ))}
    </div>
  );
}

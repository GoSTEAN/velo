"use client";

interface SideNavProps {
  tabs: { icon: React.ReactNode; name: string }[];
  activeTab: string;
  setTab: (tab: string) => void;
  showNav: boolean;
}

export default function SideNav({
  tabs,
  activeTab,
  setTab,
  showNav,
}: SideNavProps) {
  const VELO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  if (!VELO_CONTRACT_ADDRESS) {
    throw Error("failed to fetch contract address");
  }

  return (
    <div
      className={` sm:flex flex-col max-w-[203px] border-r border-border bg-nav w-2 ${
        showNav ? "flex absolute z-10 " : "hidden"
      } w-full transition-all duration-300 overflow-hidden h-screen bg-background `}
    >
      <div className="w-full h-full overflow-y-scroll flex flex-col gap-[60px] py-[40px]">
        <h1 className="px-[18px]  font-[400] text-foreground">Menu</h1>
        <div className="w-full flex flex-col gap-4">
          {tabs.map((tab, index) =>
            index < 5 ? (
              <button
                key={index}
                onClick={() => setTab(tab.name)}
                className={`w-full p-[20px_18px] flex border-l-5 items-center gap-3 transition-all ${
                  activeTab === tab.name
                    ? "bg-gradient-theme text-head border-[#2F80ED]"
                    : "text-foreground hover:bg-accent border-none"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ) : null
          )}
        </div>

        {/* Help and Logout buttons (index 5 and 6) */}
        <div className="mt-auto flex flex-col gap-4">
          {tabs.slice(5).map((tab, index) => (
            <button
              key={index + 5}
              onClick={() => setTab(tab.name)}
              className={`w-full p-[20px_18px] flex items-center gap-3 rounded-md transition-all ${
                activeTab === tab.name
                  ? "bg-gradient-theme text-head"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

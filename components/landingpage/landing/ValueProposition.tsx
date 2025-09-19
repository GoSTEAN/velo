import { Store, Building, Users, Globe } from "lucide-react";
import { HugeiconsIcon } from '@hugeicons/react';
import { UserGroup03Icon, UserGroupIcon, UserMultiple03Icon, UserShield01Icon } from "@hugeicons/core-free-icons";


const ValueProposition = () => {
  const propositions = [
    {
      icon: <HugeiconsIcon icon={UserShield01Icon} size={50}/>,
      title: "For Merchants",
      description:
        "Accept crypto payments instantly and smoothly with NGN crypto payment with built-in ledger.",
    },
    {
      icon: <HugeiconsIcon icon={UserMultiple03Icon} size={50}/>,
      title: "For SMEs",
      description:
        "Save major management. Automated split and distributions via smart contract systems.",
    },
    {
      icon: <HugeiconsIcon icon={UserGroupIcon} size={50}/>,
      title: "For Customers",
      description:
        "Faster traditional Fintech options: instant live crypto payment with transparent fees.",
    },
    {
      icon: <HugeiconsIcon icon={UserGroup03Icon} size={50} className="me-8"/>,
      title: "For Nigeria/Africa",
      description:
        "Access crypto payments without major of bank, bringing innovation to the financial sector.",
    },
  ];

  return (
    <section className="section-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Cards Grid */}
        <h1 className="text-custom-md text-head border-b-2 py-1 mb-6 border-[#2F80ED] w-fit">
            Value Proposition
          </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 justify-center items-center lg:grid-cols-4 gap-6">
          {propositions.map((prop, index) => (
            <div
              key={index}
              className="bg-button max-w-75 rounded-lg h-full p-8 space-y-4  transition-colors duration-300 group"
            >
              <div dir="ltr" className="text-button rounded-lg  group-hover:scale-110 transition-transform duration-300">
                {prop.icon}
              </div>

              <h3 className="text-xl font-semibold text-white  w-fit pb-3 border-b-2 ">
                {prop.title}
              </h3>

              <p className="text-white/90 text-sm leading-relaxed ">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;

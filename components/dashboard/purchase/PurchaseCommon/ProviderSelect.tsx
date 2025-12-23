import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Provider {
  serviceID: string;
  name: string;
  image: string;
  code?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface ProviderSelectProps {
  providers: Provider[];
  value: string;
  onChange: (service_id: string) => void;
  loading?: boolean;
  className?: string;
}

export function ProviderSelect({
  providers,
  value,
  onChange,
  loading = false,
  className = "",
}: ProviderSelectProps) {
  if (loading) {
    return (
      <div className={`flex gap-4 overflow-x-auto pb-2 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-24 h-24 rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No providers available
      </div>
    );
  }

  return (
    <div className={`flex gap-4 overflow-x-auto pb-2 w-full  ${className}`}>
      {providers.map((provider) => (
        <motion.button
          key={provider.serviceID}
        //   whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(provider.serviceID)}
          className={`w-full rounded-2xl transition-all   ${
            value === provider.serviceID
              ? " border border-border   bg-primary/10 text-primary"
              : " hover:border hover:border-primary/50 bg-muted/30"
          }`}
          style={{ minWidth: "100px" }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-full h-20 sm:h-30 relative rounded-lg overflow-hidden bg-muted/30">
              <Image
                src={provider.image}
                alt={provider.name}
                fill
                className="object-cover p-1 rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                        ${provider.name.substring(0, 2)}
                      </div>
                    `;
                  }
                }}
              />
            </div>
            <span className="text-sm font-medium text-center line-clamp-1">
              {provider.name}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
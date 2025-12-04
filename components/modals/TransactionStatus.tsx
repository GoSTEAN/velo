// /components/transactions/TransactionStatus.tsx
import React from 'react';
import { 
  Check, 
  TriangleAlert, 
  AlertCircle, 
  ArrowUpRight, 
  X,
  Loader2,
  ExternalLink,
  Info,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Card } from "@/components/ui/Card";
import { getBlockExplorerUrl } from "@/lib/utils/qr-utils";

export type StatusType = "success" | "error" | "warning" | "info" | "loading" | "pending";

export interface TransactionStatusProps {
  type: StatusType;
  message: string;
  txHash?: string;
  network?: string;
  chain?: string;
  onDismiss?: () => void;
  showIcon?: boolean;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  showExplorerLink?: boolean;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

export interface ValidationErrorProps {
  error: string | React.ReactNode;
  title?: string;
  showIcon?: boolean;
  variant?: 'default' | 'warning' | 'danger';
  className?: string;
  onRetry?: () => void;
  retryText?: string;
}

export interface SuccessMessageProps {
  message: string;
  txHash?: string;
  explorerUrl?: string;
  chain?: string;
  network?: string;
  title?: string;
  showIcon?: boolean;
  showCopyButton?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Unified Transaction Status Component
 * Supports multiple status types with consistent styling
 */
export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  type,
  message,
  txHash,
  network = "mainnet",
  chain = "ethereum",
  onDismiss,
  showIcon = true,
  showAction = false,
  actionText = "View Details",
  onAction,
  className = "",
  showExplorerLink = true,
  autoDismiss = false,
  dismissAfter = 5000,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  // Auto-dismiss for success messages
  React.useEffect(() => {
    if (autoDismiss && type === "success" && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, type, dismissAfter, isVisible, onDismiss]);

  const getStatusConfig = () => {
    const configs: Record<StatusType, {
      bg: string;
      border: string;
      icon: React.ReactNode;
      text: string;
      iconColor: string;
    }> = {
      success: {
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        icon: <Check className="w-5 h-5 text-green-500" />,
        text: "text-green-500",
        iconColor: "text-green-500",
      },
      error: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        icon: <TriangleAlert className="w-5 h-5 text-red-500" />,
        text: "text-red-500",
        iconColor: "text-red-500",
      },
      warning: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        text: "text-yellow-500",
        iconColor: "text-yellow-500",
      },
      info: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: <Info className="w-5 h-5 text-blue-500" />,
        text: "text-blue-500",
        iconColor: "text-blue-500",
      },
      loading: {
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
        icon: <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />,
        text: "text-gray-500",
        iconColor: "text-gray-500",
      },
      pending: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        icon: <ShieldAlert className="w-5 h-5 text-purple-500" />,
        text: "text-purple-500",
        iconColor: "text-purple-500",
      },
    };
    return configs[type];
  };

  if (!isVisible) return null;

  const config = getStatusConfig();
  const explorerUrl = txHash ? getBlockExplorerUrl(chain, txHash, network) : undefined;

  return (
    <div 
      className={`w-full p-4 rounded-lg border ${config.bg} ${config.border} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {showIcon && (
            <div className="flex-shrink-0 mt-0.5">
              {config.icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium ${config.text} capitalize`}>
              {type === "loading" ? "Processing..." : type}
            </div>
            <p className={`text-sm mt-1 ${config.text}`}>
              {message}
            </p>
            
            {txHash && showExplorerLink && explorerUrl && explorerUrl !== "#" && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline mt-2"
              >
                View on Explorer
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showAction && onAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAction}
              className="text-xs h-7 px-2"
            >
              {actionText}
            </Button>
          )}
          
          {onDismiss && type !== "loading" && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Unified Validation Error Component
 * For form validation errors and input warnings
 */
export const ValidationError: React.FC<ValidationErrorProps> = ({
  error,
  title = "Validation Error",
  showIcon = true,
  variant = 'default',
  className = "",
  onRetry,
  retryText = "Try Again",
}) => {
  const getVariantConfig = () => {
    const configs = {
      default: {
        bg: "bg-red-50 dark:bg-red-500/10",
        border: "border-red-200 dark:border-red-500/20",
        text: "text-red-800 dark:text-red-500",
        iconColor: "text-red-500",
      },
      warning: {
        bg: "bg-yellow-50 dark:bg-yellow-500/10",
        border: "border-yellow-200 dark:border-yellow-500/20",
        text: "text-yellow-800 dark:text-yellow-500",
        iconColor: "text-yellow-500",
      },
      danger: {
        bg: "bg-red-100 dark:bg-red-500/20",
        border: "border-red-300 dark:border-red-500/30",
        text: "text-red-900 dark:text-red-400",
        iconColor: "text-red-600 dark:text-red-400",
      },
    };
    return configs[variant];
  };

  const config = getVariantConfig();

  return (
    <div 
      className={`p-3 rounded-lg border ${config.bg} ${config.border} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2">
        {showIcon && (
          <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        )}
        
        <div className="flex-1">
          <div className={`text-sm font-medium ${config.text}`}>
            {title}
          </div>
          <div className={`text-sm mt-1 ${config.text}`}>
            {typeof error === 'string' ? error : error}
          </div>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Unified Success Message Component
 * For transaction success and other success states
 */
export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  txHash,
  explorerUrl,
  chain = "ethereum",
  network = "mainnet",
  title = "Success!",
  showIcon = true,
  showCopyButton = false,
  onClose,
  className = "",
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const finalExplorerUrl = explorerUrl || 
    (txHash ? getBlockExplorerUrl(chain, txHash, network) : undefined);

  const handleCopy = async () => {
    if (!txHash) return;
    
    try {
      await navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Card className={`p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {showIcon && (
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-400">
              {title}
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {message}
            </p>
            
            {txHash && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded">
                    {txHash.slice(0, 16)}...{txHash.slice(-8)}
                  </code>
                  
                  {showCopyButton && (
                    <button
                      onClick={handleCopy}
                      className="text-xs text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors"
                      title="Copy transaction hash"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>
                
                {finalExplorerUrl && finalExplorerUrl !== "#" && (
                  <a
                    href={finalExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View transaction on explorer
                    <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors"
            aria-label="Close success message"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </Card>
  );
};

/**
 * Loading State Component for Transactions
 */
export const TransactionLoading: React.FC<{
  message?: string;
  showSpinner?: boolean;
  className?: string;
}> = ({
  message = "Processing transaction...",
  showSpinner = true,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        {showSpinner && (
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
          </div>
        )}
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
};

/**
 * Transaction Status Indicator (Small inline version)
 */
export const StatusBadge: React.FC<{
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}> = ({ 
  status, 
  label, 
  size = 'md', 
  showDot = true 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const statusConfig = {
    success: {
      bg: 'bg-green-100 dark:bg-green-500/20',
      text: 'text-green-800 dark:text-green-400',
      dot: 'bg-green-500',
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-500/20',
      text: 'text-red-800 dark:text-red-400',
      dot: 'bg-red-500',
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-500/20',
      text: 'text-yellow-800 dark:text-yellow-400',
      dot: 'bg-yellow-500',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-500/20',
      text: 'text-blue-800 dark:text-blue-400',
      dot: 'bg-blue-500',
    },
    loading: {
      bg: 'bg-gray-100 dark:bg-gray-500/20',
      text: 'text-gray-800 dark:text-gray-400',
      dot: 'bg-gray-500 animate-pulse',
    },
    pending: {
      bg: 'bg-purple-100 dark:bg-purple-500/20',
      text: 'text-purple-800 dark:text-purple-400',
      dot: 'bg-purple-500',
    },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${statusConfig.bg} ${statusConfig.text}`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
      )}
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/**
 * Empty Transactions State
 */
export const EmptyTransactions: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}> = ({
  title = "No transactions yet",
  description = "Your transaction history will appear here",
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <Info className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default {
  TransactionStatus,
  ValidationError,
  SuccessMessage,
  TransactionLoading,
  StatusBadge,
  EmptyTransactions,
};
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Copy, 
  Check, 
  Upload, 
  X, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Image as ImageIcon, 
  ArrowDownCircle, 
  Info,
  Sparkles
} from 'lucide-react';
import { COMPANY_BANK_ACCOUNT, createDepositRequest, getUserDeposits, getPlatformSettings } from '../../services/storage';
import { User, DepositRequest } from '../../types';

interface DepositViewProps {
  user: User;
  onDepositCreated: () => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const DepositView: React.FC<DepositViewProps> = ({ user, onDepositCreated, showToast }) => {
  const platformSettings = getPlatformSettings();
  const bankAccount = {
    bankName: platformSettings.bankName || COMPANY_BANK_ACCOUNT.bankName,
    accountName: platformSettings.accountName || COMPANY_BANK_ACCOUNT.accountName,
    accountNumber: platformSettings.accountNumber || COMPANY_BANK_ACCOUNT.accountNumber,
  };

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [amount, setAmount] = useState<string>('1000');
  const [bankUsed, setBankUsed] = useState<string>('Bank of Abyssinia');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // File upload state
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  // Form submission success banner state
  const [submittedRequest, setSubmittedRequest] = useState<DepositRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const deposits = getUserDeposits(user.id);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankAccount.accountNumber);
    setCopiedAccount(true);
    showToast('success', 'Account Number Copied!', `Copied ${bankAccount.accountNumber} to clipboard.`);
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate max size 10MB
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Maximum file size allowed is 10 MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Invalid File Format', 'Please upload a JPG, JPEG, PNG, or PDF file.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate smooth progress animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setUploadProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);

        // Convert file to Base64 data URL for local storage preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }, 100);
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    setFileName('');
    setFileSize('');
    setUploadProgress(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid deposit amount.');
      return;
    }

    if (numericAmount < 500) {
      showToast('error', 'Minimum Deposit', 'Minimum deposit amount is ETB 500.');
      return;
    }

    if (!filePreview) {
      showToast('error', 'Payment Receipt Required', 'Please upload your payment screenshot or receipt.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newDeposit = createDepositRequest({
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        amount: numericAmount,
        bankUsed,
        transactionRef,
        paymentProofUrl: filePreview,
        notes,
      });

      setLoading(false);
      setSubmittedRequest(newDeposit);
      onDepositCreated();
      showToast('success', 'Deposit Submitted', 'Your payment proof has been submitted for verification.');

      // Reset Form fields
      setAmount('1000');
      setTransactionRef('');
      setNotes('');
      handleRemoveFile();
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <ArrowDownCircle className="w-4 h-4" />
          <span>Wallet Deposit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Deposit Funds</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Transfer funds via supported bank or wallet options, submit receipt proof, and receive instant wallet credit upon verification.
        </p>
      </div>

      {/* COMPANY BANK ACCOUNT CARD */}
      <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden w-full max-w-full">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/30 max-w-full">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Official Deposit Bank Account</span>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Bank Name</p>
              <h3 className="text-lg sm:text-2xl font-black text-white break-words">{bankAccount.bankName}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Account Holder Name</p>
                <p className="text-xs sm:text-sm font-bold text-slate-200 break-words">{bankAccount.accountName}</p>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">Account Number</p>
                <p className="text-base sm:text-lg font-black font-mono text-blue-300 tracking-wider break-all">
                  {bankAccount.accountNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col justify-center">
            <button
              onClick={handleCopyAccount}
              className={`w-full md:w-auto px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                copiedAccount
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-105'
              }`}
            >
              {copiedAccount ? (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Account Number Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Copy Account Number</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DEPOSIT INSTRUCTIONS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">How to Deposit Funds</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Follow these 9 easy steps to credit your wallet.</p>
          </div>
        </div>

        <ol className="grid sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700 dark:text-slate-300">
          {[
            'Transfer the amount you want to invest to the ZelSurvey bank account above.',
            'Save the payment receipt or transaction screenshot after the transfer is complete.',
            'Return to this Deposit page.',
            'Enter the exact amount you transferred in ETB.',
            'Select the bank you used for the transfer.',
            'Upload your payment screenshot or receipt image/PDF.',
            'Click "Submit Deposit".',
            'Your request will remain "Pending Verification" until reviewed by an administrator.',
            'Once approved, the deposited amount will automatically appear in your wallet balance.',
          ].map((stepText, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{stepText}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* SUBMISSION SUCCESS BANNER */}
      {submittedRequest && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-slate-900 dark:text-slate-100 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              ✅
            </div>
            <div>
              <h3 className="text-base font-black text-amber-900 dark:text-amber-200">Deposit Submitted Successfully</h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Your payment proof of <span className="font-bold">ETB {submittedRequest.amount.toLocaleString()}</span> has been received.
              </p>
            </div>
          </div>

          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-xs space-y-1">
            <p className="font-bold flex items-center gap-2">
              <span>Status:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Pending Verification</span>
              </span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Your wallet balance will remain unchanged until the administrator approves your payment in the Admin Panel.
            </p>
          </div>
        </motion.div>
      )}

      {/* DEPOSIT FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Payment Proof</h3>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Deposit Amount */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deposit Amount (ETB)
              </label>
              <input
                type="number"
                min={500}
                step={100}
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
              />
            </div>

            {/* Bank Used */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank / Wallet Used
              </label>
              <select
                value={bankUsed}
                onChange={(e) => setBankUsed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Telebirr / Mobile Money">Telebirr / Mobile Money</option>
                <option value="Local Bank Account">Local Bank Account</option>
              </select>
            </div>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transaction Reference / FT Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. TXN-248910034"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          {/* Drag & Drop Payment Screenshot Upload */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Upload Payment Screenshot / Receipt (Max 10 MB)
            </label>

            {!filePreview ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-xs">
                    Drag and drop your transaction receipt here, or <span className="text-blue-600 underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Supported Formats: JPG, JPEG, PNG, PDF (Up to 10 MB)</p>
                </div>

                {isUploading && (
                  <div className="mt-4 max-w-xs mx-auto space-y-1">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-blue-600 font-bold">Uploading receipt... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  {filePreview.startsWith('data:image') ? (
                    <img src={filePreview} alt="Receipt Preview" className="w-14 h-14 object-cover rounded-xl border" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{fileName}</p>
                    <p className="text-[10px] text-slate-400">{fileSize}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600">✓ Ready to submit</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Remove File"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Notes Optional */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sent from Mobile Banking account Abebe T."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Submit Deposit for Verification</span>
              </>
            )}
          </button>

        </form>
      </div>

      {/* DEPOSIT HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">My Deposit History</h3>

        {deposits.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No deposits submitted yet. Submit your first payment proof above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Bank Used</th>
                  <th className="py-3 px-2">Ref / Proof</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {deposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(dep.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                      ETB {dep.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{dep.bankUsed}</td>
                    <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">
                      {dep.transactionRef || dep.id}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {dep.status === 'Pending' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>🟡 Pending</span>
                        </span>
                      )}
                      {dep.status === 'Approved' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>🟢 Approved</span>
                        </span>
                      )}
                      {dep.status === 'Rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>🔴 Rejected</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

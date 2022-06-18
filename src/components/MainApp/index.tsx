import React, { useEffect, useState } from "react";
import {
    Transaction,
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { successToast, errorToast, loadingToast } from "../Notification";
import { SolanaNetworkType } from "../../App";
import LoadingSkeleton from "../LoadingSkeleton";
import {
    checkTransactionConfirmation,
    getAccountBalance,
    validateAddress,
} from "../../utils/general";

interface MainProps {
    solanaNetwork: SolanaNetworkType;
}

export default function MainApp({ solanaNetwork }: MainProps) {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [isBusy, setIsBusy] = useState(false);

    const [refreshCount, setRefreshCount] = useState<number>(0);
    const [receiverAddress, setReceiverAddress] = useState<string>("");
    const [receiverAmount, setReceiverAmount] = useState<number | string>("");
    const [transactionSignature, setTransactionSignature] = useState<{
        message: string;
        link: string;
    } | null>(null);

    const [walletBalance, setWalletBalance] = useState<string | number | null>(
        null
    );

    useEffect(() => {
        if (wallet.publicKey) {
            setWalletBalance(null);
            getAccountBalance(connection, wallet.publicKey)
                .then((walletBalance) => {
                    setWalletBalance(walletBalance);
                })
                .catch((error) => {
                    console.error(
                        "Error in fetching wallet balance => ",
                        error
                    );
                    setWalletBalance("---");
                });
        }
    }, [wallet, refreshCount]);

    useEffect(() => {
        if (transactionSignature) {
            setTimeout(() => {
                setTransactionSignature(null);
            }, 15000);
        }
    }, [transactionSignature]);

    const resetInputs = () => {
        setReceiverAddress("");
        setReceiverAmount("");
    };

    const handleRefresh = () => {
        resetInputs();
        setRefreshCount((prevState) => prevState + 1);
    };

    // function to handle button click
    const sendSOLHandler = async () => {
        try {
            if (!wallet.publicKey) {
                errorToast("No wallet connected!");
                return;
            }

            if (!receiverAddress) {
                errorToast("No receiver address entered!");
                return;
            }

            if (!validateAddress(receiverAddress)) {
                errorToast("Invalid receiver address!");
                return;
            }

            if (!receiverAmount) {
                errorToast("No receiver amount entered!");
                return;
            }

            if (receiverAmount <= 0) {
                errorToast("Invalid amount! Should be greater than 0");
                return;
            }

            if (walletBalance) {
                if (receiverAmount > walletBalance) {
                    errorToast("Insufficient SOL balance");
                    return;
                }
            }

            const receiverPublicKey = new PublicKey(receiverAddress);

            setIsBusy(true);
            loadingToast(`Sending ${receiverAmount} SOL`);

            const transaction = new Transaction();

            const instruction = SystemProgram.transfer({
                fromPubkey: wallet?.publicKey,
                toPubkey: receiverPublicKey,
                lamports: LAMPORTS_PER_SOL * Number(receiverAmount),
            });

            transaction.add(instruction);

            const signature = await wallet.sendTransaction(
                transaction,
                connection
            );

            const isConfirmed = await checkTransactionConfirmation(
                connection,
                signature
            );

            if (isConfirmed) {
                successToast(`Sent ${receiverAmount} SOL successfully!`);
            } else {
                errorToast(
                    `Couldn't confirm transaction! Please check on Solana Explorer`
                );
            }
            setTransactionSignature({
                link: `https://explorer.solana.com/tx/${signature}?cluster=${solanaNetwork}`,
                message: `You can view your transaction on the Solana Explorer at:\n`,
            });
            setIsBusy(false);
            handleRefresh();
        } catch (error) {
            setIsBusy(false);
            handleRefresh();
            errorToast("Something went wrong while sending SOL!");
            console.error("solSendHandler => ", error);
        }
    };

    const renderRefreshButton = () => {
        return (
            <button
                type="button"
                onClick={handleRefresh}
                className="mx-4 text-2xl text-secondary bg-gray-600 rounded-full flex items-center justify-center w-8 h-8 hover:bg-gray-700"
            >
                <i className="bi bi-arrow-repeat" />
            </button>
        );
    };

    return (
        <main className="main">
            <h1 className="heading-1 text-center my-4 sm:px-4">
                Send SOL to any address using{" "}
                <u className="underline-offset-2">Sol Sender</u>
            </h1>

            {wallet?.publicKey ? (
                <div className="my-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center mt-10 text-xl">
                        <p className="text-primary mr-4">Wallet Balance:</p>
                        <div className="text-secondary mt-3 sm:mt-0">
                            {walletBalance ? (
                                `${walletBalance} SOL`
                            ) : (
                                <LoadingSkeleton
                                    width="10rem"
                                    height="2.1rem"
                                />
                            )}
                        </div>
                        {walletBalance && renderRefreshButton()}
                    </div>
                    <div className="flex justify-center items-center flex-wrap my-8">
                        <div className="w-[100%] sm:w-[500px] flex flex-col items-center mb-4 sm:items-start">
                            <input
                                className="text-input w-[90%]"
                                type="text"
                                placeholder="Enter account address where you want to send SOL"
                                value={receiverAddress}
                                onChange={(event) => {
                                    setReceiverAddress(event.target.value);
                                }}
                            />

                            <input
                                className="text-input w-[90%] sm:w-[55%]"
                                type="number"
                                placeholder="Enter amount to be sent (in SOL)"
                                value={receiverAmount}
                                onChange={(event) => {
                                    setReceiverAmount(
                                        Number(event.target.value)
                                    );
                                }}
                                min={0}
                            />
                        </div>

                        <button
                            type="button"
                            className="button w-[40%] sm:w-auto"
                            onClick={sendSOLHandler}
                            disabled={isBusy}
                        >
                            Send SOL
                        </button>
                    </div>
                    {transactionSignature && (
                        <div className="mt-10 text-lg mx-auto text-center w-[90%] sm:max-w-[60%]">
                            <p className="text-primary">
                                {transactionSignature.message}{" "}
                                <a
                                    className="link break-words"
                                    href={transactionSignature.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {transactionSignature.link}
                                </a>
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-secondary text-xl text-center mt-20">
                    Please connect wallet to use the app.
                </p>
            )}
        </main>
    );
}

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks';
import {
    saveAccountInfos,
    saveActiveAccountIndex,
    setAccountInfos,
} from '../../redux/slices/account';
import { thunkExtras } from '../../redux/store/thunk-extras';
import EmojiDisplay from '../../shared/EmojiDisplay';
import Button from '../../shared/buttons/Button';
import BasicSectionHeader from '../../shared/headers/section-headers/BasicSectionHeader';
import Input from '../../shared/inputs/Input';
import ColorPickerMenu from '../../shared/inputs/colors/ColorPickerMenu';
import BodyLarge from '../../shared/typography/BodyLarge';
import Loading from '../loading';
import Authentication from '_src/background/Authentication';

import type { AccountInfo } from '../../KeypairVault';

type EmojiPickerResult = {
    shortcodes: string;
};

interface EditWalletProps {
    setIsWalletEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditWallet = ({ setIsWalletEditing }: EditWalletProps) => {
    const [loading, setLoading] = useState(false);
    const [isColorPickerMenuOpen, setIsColorPickerMenuOpen] = useState(false);
    const [isEmojiPickerMenuOpen, setIsEmojiPickerMenuOpen] = useState(false);
    const [searchParams] = useSearchParams();

    const _accountInfos = useAppSelector(({ account }) => account.accountInfos);
    let walletIndex = 0;
    const indexFromParam = searchParams.get('index');
    if (indexFromParam !== null) {
        walletIndex = +indexFromParam;
    }
    const currentAccountInfo = _accountInfos[walletIndex];
    const draftAccountInfos = useRef<AccountInfo[]>(_accountInfos);

    const [draftName, setDraftName] = useState<string>(
        currentAccountInfo.name ||
            `Wallet${
                currentAccountInfo.index > 0
                    ? ' ' + currentAccountInfo.index + 1
                    : ''
            }`
    );

    const [draftColor, setDraftColor] = useState<string>(
        currentAccountInfo.color || '#7E23CA'
    );

    const [draftEmoji, setDraftEmoji] = useState<string | undefined>(
        currentAccountInfo.emoji
    );

    const authentication = useAppSelector(
        ({ account }) => account.authentication
    );
    const keypairVault = thunkExtras.keypairVault;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const toggleIsColorPickerMenuOpen = useCallback(() => {
        setIsColorPickerMenuOpen(!isColorPickerMenuOpen);
    }, [isColorPickerMenuOpen]);

    const toggleIsEmojiPickerMenuOpen = useCallback(() => {
        setIsEmojiPickerMenuOpen(!isEmojiPickerMenuOpen);
    }, [isEmojiPickerMenuOpen]);

    const getAccountInfos = useCallback(async () => {
        if (authentication) return;

        if (draftAccountInfos.current.length === 0) {
            draftAccountInfos.current = [
                {
                    index: 0,
                    address: keypairVault.getAddress(0) || '',
                    seed: (keypairVault.getSeed(0) || '').toString(),
                },
            ];
        }
    }, [authentication, keypairVault]);

    const _saveAccountInfos = useCallback(async () => {
        setLoading(true);
        if (authentication) {
            await Authentication.updateAccountInfos(draftAccountInfos.current);
            await dispatch(setAccountInfos(draftAccountInfos.current));
            await Authentication.getAccountInfos(true);
        } else {
            await dispatch(saveAccountInfos(draftAccountInfos.current));
            await dispatch(
                saveActiveAccountIndex(draftAccountInfos.current.length - 1)
            );
            getAccountInfos();
        }

        setLoading(false);
        setIsWalletEditing(true);
        navigate(-1);
    }, [
        authentication,
        dispatch,
        getAccountInfos,
        navigate,
        setIsWalletEditing,
    ]);

    const _handleChange = useCallback(
        ({
            name,
            color,
            emoji,
        }: {
            name?: string;
            color?: string;
            emoji?: string;
        }) => {
            draftAccountInfos.current = draftAccountInfos.current.map(
                (accountInfo: AccountInfo) => {
                    if (accountInfo.index === currentAccountInfo.index) {
                        return {
                            ...accountInfo,
                            name: name || accountInfo.name,
                            color: color || accountInfo.color,
                            emoji: emoji || accountInfo.emoji,
                        };
                    } else {
                        return accountInfo;
                    }
                }
            );
        },
        [currentAccountInfo.index]
    );

    const _handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newName = e.target.value;
            setDraftName(newName);
            _handleChange({ name: newName });
        },
        [_handleChange]
    );

    const _handleColorChange = useCallback(
        (colorResult: string) => {
            const color = colorResult;
            setDraftColor(color);
            _handleChange({ color });
            setIsColorPickerMenuOpen(false);
        },
        [_handleChange]
    );

    const _handleEmojiChange = useCallback(
        (emojiPickerResult: EmojiPickerResult) => {
            setDraftEmoji(emojiPickerResult.shortcodes);
            _handleChange({ emoji: emojiPickerResult.shortcodes });
            setIsEmojiPickerMenuOpen(false);
        },
        [_handleChange]
    );

    return (
        <>
            <BasicSectionHeader text="Edit Wallet"></BasicSectionHeader>
            <div className="flex flex-col">
                <Input value={draftName} onChange={_handleNameChange} />
                <div className="flex justify-between items-center px-6 pb-6">
                    <BodyLarge isSemibold>Choose a Color</BodyLarge>
                    <div className="p-1 rounded-md border border-ethos-light-text-stroke dark:border-ethos-dark-text-stroke">
                        <div
                            data-testid="color-picker"
                            className="w-12 h-12 rounded-sm cursor-pointer"
                            style={{ backgroundColor: draftColor }}
                            onClick={toggleIsColorPickerMenuOpen}
                        />
                    </div>
                </div>
                <div className="relative mx-6">
                    {isColorPickerMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                data-testid="emoji-picker"
                                className="absolute -top-[223px] -left-[24px] w-[360px] h-[564px]"
                                onClick={toggleIsColorPickerMenuOpen}
                            />

                            <div className="absolute">
                                <ColorPickerMenu
                                    selectedColor={draftColor}
                                    setSelectedColor={_handleColorChange}
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex justify-between items-center px-6 pb-6">
                    <BodyLarge isSemibold>Choose an Emoji</BodyLarge>
                    <div
                        data-testid="emoji-picker"
                        className="p-1 rounded-md cursor-pointer border border-ethos-light-text-stroke dark:border-ethos-dark-text-stroke"
                        onClick={toggleIsEmojiPickerMenuOpen}
                    >
                        <div className="flex w-12 h-12 rounded-sm place-content-center items-center">
                            <EmojiDisplay emoji={draftEmoji} sizeInPx={48} />
                        </div>
                    </div>
                </div>
                {isEmojiPickerMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="absolute w-full h-full top-0"
                            onClick={toggleIsEmojiPickerMenuOpen}
                        />

                        <div className="absolute left-1">
                            <Picker
                                data={data}
                                onEmojiSelect={_handleEmojiChange}
                            />
                        </div>
                    </>
                )}
                <div className="relative mx-6"></div>
                <Button buttonStyle="primary" onClick={_saveAccountInfos}>
                    <Loading loading={loading}>Done</Loading>
                </Button>
            </div>
        </>
    );
};

export default EditWallet;

// Copyright (c) 2022, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { memo, useEffect } from 'react';

import LoadingIndicator from './LoadingIndicator';

import type { ReactNode } from 'react';

type LoadingProps = {
    loading: boolean;
    children: ReactNode | ReactNode[];
    className?: string;
    big?: boolean;
};

const Loading = ({ loading, children, className, big }: LoadingProps) => {
    useEffect(() => {
        if (loading) return;
        Promise.all(
            Array.from(document.images)
                .filter((img) => !img.complete)
                .map(
                    (img) =>
                        new Promise((resolve) => {
                            img.onload = img.onerror = resolve;
                        })
                )
        ).then(() => {
            setTimeout(() => {
                window.resizeTo(
                    document.body.offsetWidth,
                    document.body.offsetHeight + 30
                );
            }, 100);
        });
    }, [loading]);

    return loading ? (
        className ? (
            <div className={className}>
                <LoadingIndicator big={big} />
            </div>
        ) : (
            <LoadingIndicator big={big} />
        )
    ) : (
        <>{children}</>
    );
};

export default memo(Loading);

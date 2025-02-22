import { screen } from '@testing-library/react';

import App from '_app/index';
import { simulateAuthenticatedUser } from '_src/test/utils/fake-local-storage';
import mockSuiObjects from '_src/test/utils/mockchain';
import { renderWithProviders } from '_src/test/utils/react-rendering';

describe('Rendering the Tokens page', () => {
    beforeEach(async () => {
        simulateAuthenticatedUser();
    });

    test('rendering the Tokens page when wallet has no coins', async () => {
        mockSuiObjects();
        renderWithProviders(<App />);
        await screen.findByText('Get started with Sui');
    });

    // Not yet working
    xtest('rendering the Tokens page when the wallet has some coins', async () => {
        mockSuiObjects({ suiBalance: 400000000 });
        renderWithProviders(<App />);
        await screen.findByText('0.4 SUI');
    });
});

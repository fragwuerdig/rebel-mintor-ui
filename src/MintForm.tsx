import { useState } from 'react';
import { Box, Button, MenuItem, Select, TextField, Typography, FormControl, InputLabel } from '@mui/material';
import { fromBech32 } from "@cosmjs/encoding";

const assets = ['lunc', 'juris'];
const API_URL = import.meta.env.VITE_API_URL;

const isValidAddress = (address: string, prefix: string): boolean => {
    try {
        const decoded = fromBech32(address);
        if (!decoded) {
            return false;
        }
        return decoded.prefix === prefix;
    } catch (e) {
        return false;
    }
}

const mintAsset = async (asset: string, address: string) => {
    let assetLower = asset.toLowerCase();
    const response = await fetch(`${API_URL}/v1/mint/${assetLower}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver: address }),
    });

    if (!response.ok) {
        let obj = await response.json();
        throw new Error('Faucet request failed: ' + (obj.error || 'Unknown error'));
    }

    return response.json();
}

export default function MintForm() {
    const [asset, setAsset] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!asset || !address) {
            setResult('❌ Error: Please fill in all fields.');
            return;
        }

        if (!isValidAddress(address, 'terra')) {
            setResult('❌ Error: Invalid Terra address.');
            return;
        }

        try {
            setLoading(true);
            const res = await mintAsset(asset, address);
            setResult(`✅ Success: ${JSON.stringify(res.message)}`);
        } catch (err: any) {
            setResult(`❌ Error: ${err.message}`);
        } finally {
            setTimeout(() => setResult(null), 6000);
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" gutterBottom>
                Terra Classic Testnet Faucet
            </Typography>

            <FormControl fullWidth>
                <InputLabel id="asset-select-label">Asset</InputLabel>
                <Select
                    labelId="asset-select-label"
                    value={asset}
                    label="Asset"
                    onChange={(e) => setAsset(e.target.value)}
                >
                    {assets.map((a) => (
                        <MenuItem key={a} value={a}>{a.toUpperCase()}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="Receiver Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
            />

            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending...' : 'Request'}
            </Button>

            {result && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                    {result}
                </Typography>
            )}
        </Box>
    );
}

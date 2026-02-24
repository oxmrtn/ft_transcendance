
export async function sendDataToSandbox( file_name: string)
{
    const sandboxUrl = 'http://sandbox:4444/receive';

    const payload = {
        file_name,
    };

    try {
        const response = await fetch(sandboxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Error from sandbox: ${response.statusText}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Failed to send data to sandbox", error.message);
    }
}
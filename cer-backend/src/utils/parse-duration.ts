export function parseDurationToSeconds(str: string): number {
    if (!str) throw new Error("Duration is required");

    const m = str.match(/^(\d+)([smhd])$/);
    if (!m) throw new Error(`Invalid duration format: ${str}`);

    const n = parseInt(m[1]!, 10);

    switch (m[2]) {
        case 's': return n;
        case 'm': return n * 60;
        case 'h': return n * 60 * 60;
        case 'd': return n * 24 * 60 * 60;
    }

    throw new Error(`Invalid unit in duration: ${str}`);
}
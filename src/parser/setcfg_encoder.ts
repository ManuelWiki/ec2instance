// Here must lie an encoder for setcfg commands as STRINGS
// Validation is missing

export class ConfigParams {
    // These are the coefficients taken from Ruptela's Config Params Page
    time_wo_engine?: number;
    distance?: number;
    time_w_engine?: number;
    radial?: number;
}

class ParamIDs {
    time_wo_engine = 1122;
    distance = 1124;
    time_w_engine = 1125;
    radial = 1126;
}
const paramIDs = new ParamIDs();

export function encodeSetcfg(options: ConfigParams): String {
    let head = 'setcfg ';
    const params = Object.entries(options)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${paramIDs[key as keyof ParamIDs]} ${value}`)
        .join(', ');
    return head + params;
}

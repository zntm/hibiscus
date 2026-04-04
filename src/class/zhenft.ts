export enum ZhenFTRarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Mythic,
}

export class ZhenFT {
    owners: ZhenFTOwner[];
    color: string;
    accessory: string;
    body: string;
    face: string;
    head: string;
    obtained: number;

    constructor(
        color: string,
        accessory: string,
        body: string,
        face: string,
        head: string,
        obtained: number,
    ) {
        this.owners = [];

        this.color = color;
        this.accessory = accessory;
        this.body = body;
        this.face = face;
        this.head = head;

        this.obtained = obtained;
    }

    addOwner(id: string, obtained: number) {
        this.owners.push(new ZhenFTOwner(id, obtained));

        return this;
    }
}

export class ZhenFTOwner {
    id: string;
    obtained: number;

    constructor(userId: string, obtained: number) {
        this.id = userId;
        this.obtained = obtained;
    }
}

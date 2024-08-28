import {LayoutType} from './tidy';

export enum LayoutTypeStr {
    Tidy = 'tidy',
    Basic = 'basic',
    LayeredTidy = 'layeredTidy',
}

export function getLayoutType(type?: LayoutTypeStr) {
    if (type == null) {
        return LayoutType.TidyTidy;
    }

    switch (type) {
    case LayoutTypeStr.Basic:
        return LayoutType.Basic;
    case LayoutTypeStr.Tidy:
        return LayoutType.Tidy;
    case LayoutTypeStr.LayeredTidy:
        return LayoutType.LayeredTidy;
    default:
        throw new Error();
    }
}

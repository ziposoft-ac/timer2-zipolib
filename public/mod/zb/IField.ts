export interface  IField {
    type ? : string;
    showList : boolean;
    summary : boolean;
    id : string;
    name : string;
}
export interface  IFieldSet {
    set : Record<string,IField>;
}
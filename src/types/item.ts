export default interface Item {
  first: string;
  last: string;
  age: number;
  index: number;
  address: {
    postcode: string;
    addressLine1: string;
  };
}

export function buildItems(numberToBuild: number) {
  return Array(numberToBuild)
    .fill(0)
    .map((_, index): Item => {
      return {
        index,
        first: `Adam${index % 20}`,
        last: `Lansley${index % 20}`,
        age: index % 20,
        address: {
          postcode: `PO${index % 20} 000`,
          addressLine1: "Address Line 1",
        },
      };
    });
}

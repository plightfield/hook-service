export function getTarget(
  obj: any,
  keyArr: string[]
): { value: any; target: any } {
  if (typeof obj !== "object") {
    throw new Error(`${obj} is invalid`);
  }
  if (keyArr.length === 1) {
    return { value: obj[keyArr[0]], target: obj };
  }
  const nowKey = keyArr.shift();
  if (nowKey && obj[nowKey]) {
    return getTarget(obj[nowKey], keyArr);
  } else {
    throw new Error(`cannot read '${nowKey}' of ${obj} `);
  }
}

export function setTarget(obj: any, keyArr: string[], value: any): any {
  if (typeof obj !== "object") {
    throw new Error(`${obj} is invalid`);
  }
  if (keyArr.length === 1) {
    return Object.assign(obj, { [keyArr[0]]: value });
  }
  const nowKey = keyArr.shift();
  if (nowKey && obj[nowKey]) {
    return Object.assign(obj, {
      [nowKey]: setTarget(obj[nowKey], keyArr, value),
    });
  } else {
    throw new Error(`cannot read '${nowKey}' of ${obj} `);
  }
}

export function getTargetByKey(obj: any, key: string) {
  if (Object.prototype.toString.call(key) !== "[object String]") {
    throw new Error("key must be string");
  } else {
    return getTarget(obj, key.split("."));
  }
}

export function setTargetByKey(obj: any, key: string, value: any) {
  if (Object.prototype.toString.call(key) !== "[object String]") {
    throw new Error("key must be string");
  } else {
    return setTarget(obj, key.split("."), value);
  }
}

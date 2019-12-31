import logfmt from 'logfmt'
import flat from 'flat'

export default function stringify(obj: Object): string {
  return logfmt.stringify(flat(obj))
}

import { Injectable,
		PipeTransform,
		ArgumentMetadata,
	} from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {

	private isObj(obj: any): boolean
	{
		return typeof obj === 'object' && obj !== null;
	}

	private trim(values, _refs )
	{
		if (_refs.has(values))
			return
		_refs.add(values)
		Object.keys(values).forEach((key) =>
		{

			if (key !== 'password')
			{
				if (this.isObj(values[key]))
					{
						this.trim(values[key], _refs);
					}
				else if (typeof values[key] === 'string')
				{
					console.log(values[key]);
					values[key] = values[key].trim();
				}
			}
		});
		_refs.delete(values);
		return values;
	}

	transform(values: any, metadata: ArgumentMetadata)
	{
		const { type } = metadata;
		const _refs = new WeakSet;
		if (this.isObj(values) && type === 'body')
		{
			return this.trim(values, _refs);
		}
		return values;
	}
}
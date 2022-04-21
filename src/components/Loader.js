import React, { useEffect, useState } from 'react'
import { loadAsync } from 'expo-three'

const Loader = ({ asset }) => {
	const [loaded, setLoaded] = useState(null);

	useEffect(() => {
		const load = async () => {
			const result = await loadAsync(asset);
			setLoaded(result)
		}
	}, [asset])

	return loaded;
}

export default Loader;

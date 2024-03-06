import React, { useEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { View } from 'react-native';

const Marshmallow = ({ percentageComplete }) => {
	const viewRef = useRef();

	useEffect(() => {
		viewRef.current.injectJavaScript(`window.progress = ${percentageComplete}`);
	}, [percentageComplete]);

	return (
		<View
			style={{
				height: '100%',
				width: '100%',
			}}	>

			<WebView
				ref={viewRef}
				source={{
					uri: `https://d1spotbdoufgh0.cloudfront.net/index.html`,
				}}
				style={{
					height: '100%',
					width: '100%',
				}}
			/>
		</View>
	);
};

export default Marshmallow;

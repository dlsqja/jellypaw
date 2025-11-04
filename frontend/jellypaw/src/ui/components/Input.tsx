import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { AppText } from './AppText';

type Props = {
  label?: string;
  errorText?: string;
} & TextInputProps;

export default function Input({ label, errorText, style, editable = true, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ width: '100%', marginBottom: 20 }}>
      {label ? (
        <AppText style={S.label}>{label}</AppText>
      ) : null}

      <View
        style={[
          S.field,
          focused && S.fieldFocused,
          !editable && S.fieldReadonly,
          style,
        ]}
      >
        <TextInput
          {...rest}
          editable={editable}
          style={S.input}
          placeholderTextColor="#A3A3A3"
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
      </View>

      {errorText ? <AppText style={S.error}>{errorText}</AppText> : null}
    </View>
  );
}

const S = StyleSheet.create({
  label: {
    color: '#284542',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Pretendard-SemiBold',
  },
  field: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  fieldFocused: { borderColor: '#6ABFB8' },
  fieldReadonly: { backgroundColor: '#F7F7F7' },
  input: {
    padding: 0,
    margin: 0,
    color: '#284542',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
  },
  error: {
    marginTop: 6,
    color: '#e85555',
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
  },
});

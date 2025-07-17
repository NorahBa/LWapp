import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useField } from "formik";
import { MaterialIcons } from "@expo/vector-icons";

type InputType = "text" | "email" | "number" | "password";

interface FormikInputProps extends TextInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: InputType;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

const FormikInput: React.FC<FormikInputProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  icon,
  ...rest
}) => {
  const [field, meta, helpers] = useField(name);
  const [secure, setSecure] = useState(type === "password");

  const getKeyboardType = () => {
    switch (type) {
      case "email":
        return "email-address";
      case "number":
        return "numeric";
      default:
        return "default";
    }
  };

  const toggleSecureEntry = () => setSecure(!secure);

  return (
    <View style={styles.inputGroup}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWithIcon,
          meta.touched && meta.error ? styles.inputError : null,
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#D9D9D9"
          keyboardType={getKeyboardType()}
          autoCapitalize={type === "email" ? "none" : "sentences"}
          secureTextEntry={type === "password" && secure}
          onChangeText={helpers.setValue}
          onBlur={() => helpers.setTouched(true)}
          value={field.value}
          {...rest}
        />
        {type === "password" && (
          <TouchableOpacity onPress={toggleSecureEntry}>
            <MaterialIcons
              name={secure ? "visibility-off" : "visibility"}
              size={20}
              color="#999"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {meta.touched && meta.error && (
        <Text style={styles.error}>{meta.error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#D9D9D9",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#3F4346",
    paddingLeft: 10,
    height: 35,
  },
  inputIcon: {
    marginRight: 5,
  },
  eyeIcon: {
    marginLeft: 5,
  },
  inputError: {
    borderColor: '#F3B545',
  },
  error: {
    color: '#F3B545',
    marginTop: 4,
    marginLeft: 10,
    fontSize: 13,
  },
});

export default FormikInput;
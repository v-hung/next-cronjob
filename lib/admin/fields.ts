import { SampleColumnsType, SampleFieldAndDetailsType } from "./sample"
import AdminFormFieldText from "@/components/admin/form-field/AdminFormFieldText";
import AdminFormFieldRichText from "@/components/admin/form-field/AdminFormFieldRichText";
import AdminFormFieldNumber from "@/components/admin/form-field/AdminFormFieldNumber";
import AdminFormFieldBool from "@/components/admin/form-field/AdminFormFieldBool";
import AdminFormFieldDateTime from "@/components/admin/form-field/AdminFormFieldDateTime";
import AdminFormFieldFile from "@/components/admin/form-field/AdminFormFieldFile";
import AdminFormFieldSelect from "@/components/admin/form-field/AdminFormFieldSelect";
import AdminFormFieldRelation from "@/components/admin/form-field/AdminFormFieldRelation";
import AdminFormFieldPermissions from "@/components/admin/form-field/AdminFormFieldPermissions";
import { PermissionsOnRoles } from "@prisma/client";
import AdminFormFieldPassword from "@/components/admin/form-field/AdminFormFieldPassword";
import AdminFormFieldSlug from "@/components/admin/form-field/AdminFormFieldSlug";

export type DataFieldType = Record<SampleFieldAndDetailsType['type'], {
  fieldName: string,
  icon: string,
  Component: React.FC<{
    label?: string | null,
    isReturnData?: boolean,
    name?: string
    required?: boolean | null,
    defaultValue?: any,
    value?: any,
    onChange?: (data: any) => void
    className?: string,
    details: any,
  }> | null,
  defaultValue?: any
}>

export const DATA_FIELDS: DataFieldType = {
  'string': { fieldName: "Plain text", icon: 'title', Component: AdminFormFieldText },
  'slug': { fieldName: "Slug", icon: 'text_fields', Component: AdminFormFieldSlug },
  'text': { fieldName: "Rich text", icon: 'border_color', Component: AdminFormFieldRichText },
  'int': { fieldName: "Number", icon: 'tag', Component: AdminFormFieldNumber },
  'bool': { fieldName: "Boolean", icon: 'toggle_on', Component: AdminFormFieldBool, defaultValue: false },
  'date': { fieldName: "Date Time", icon: 'calendar_today', Component: AdminFormFieldDateTime },
  'file': { fieldName: "File", icon: 'attachment', Component: AdminFormFieldFile },
  'select': { fieldName: "Select", icon: 'checklist', Component: AdminFormFieldSelect },
  'relation': { fieldName: "Relation", icon: 'network_node', Component: AdminFormFieldRelation },
  'publish': { fieldName: "Publish", icon: 'publish', Component: null },
  'permissions': { fieldName: "Permission", icon: 'encrypted', Component: AdminFormFieldPermissions },
  'password': { fieldName: "Password", icon: 'key', Component: AdminFormFieldPassword },
  'custom': { fieldName: "Custom", icon: 'instant_mix', Component: AdminFormFieldText},
}

export const findSettingByName = (arr: any[], name: string) : any | undefined => {
  return arr.find(v => v.name == name)?.value ?? undefined
}

export const checkPermissions = (permission: PermissionsOnRoles[], tableName: string, 
  key: 'browse' | 'create' | 'edit' | 'delete' | 'image' 
): boolean => {
  return permission.findIndex(v => v.permissionTableName == tableName && v.permissionKey == key) >= 0
}

export const createDefaultValue = (column: SampleColumnsType) => {
  if (column.type == "custom" && column.details.defaultValue) {
    return column.details.defaultValue
  }

  const dataField = DATA_FIELDS[column.type]
  if (typeof dataField.defaultValue != "undefined") {
    return dataField.defaultValue
  }

  return ''
}
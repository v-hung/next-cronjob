"use client"
import { useEffect, useState, FC } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { GroupSettingType, GroupType } from '@/app/admin/(admin)/settings/page';
import { DATA_FIELDS, createDefaultValue } from '@/lib/admin/fields';
import { promiseFunction } from '@/lib/admin/promise';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { SampleColumnSlugType } from '@/lib/admin/sample';

type State = {
  groupSettings: GroupSettingType[],
  createEditSetting: () => Promise<void>
  saveSetting: (data: any) => Promise<void>
  canDelete: boolean,
  canEdit: boolean,
  canCreate: boolean,
  GROUPS: GroupType[]
}

const SettingContentAdmin: FC<State> = ({
  groupSettings, createEditSetting, saveSetting,
  canDelete, canCreate, canEdit, GROUPS
}) => {
  const router = useRouter()
  const [groupActive, setGroupActive] = useState(groupSettings.length > 0 ? groupSettings[0] : undefined);

  const settings = groupActive != undefined ? groupActive.settings : []

  const [openUpdateSettingModal, setOpenUpdateSettingModal] = useState(false)

  useEffect(() => {
    setGroupActive(groupSettings.length > 0 ? groupSettings[0] : undefined)
  }, [groupSettings])

  // list data
  const [listDataValue, setListDataValue] = useState<{
    name: string,
    value: any
  }[]>(groupActive?.settings.map(v => ({ name: v.name, value: v.value ?? createDefaultValue(v)})) || [])

  useEffect(() => {
    setListDataValue(groupActive?.settings.map(v => ({ name: v.name, value: v.value ?? createDefaultValue(v)})) || [])
  }, [groupActive])

  const onChangeValue = (value: any, name: string) => {
    let columns = GROUPS.find(v => v.name == groupActive?.name)?.settings || []

    let column = (columns.filter(v => v.type == "slug") as ({
      name: string
    } & SampleColumnSlugType)[]).find(v => v.details.tableNameSlug == name)

    setListDataValue(state => state.map(v => {
      if (column && v.name == column.name) {
        return { ...v, value: slugify(value, {
          replacement: '_',
          lower: true,
          locale: 'vi',
          trim: false
        }) }
      }

      if (v.name == name) {
        return {...v, value}
      }

      return v
    }))
  }


  // save settings
  const [loading, setLoading] = useState(false)
  const handelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await promiseFunction({
      loading: loading,
      setLoading: setLoading,
      callback: async () => {
        await saveSetting(listDataValue)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="-my-4 flex flex-col" style={{minHeight: 'calc(100vh - 64px)'}}>
        <div className="-mx-8 px-8 border-b bg-white pt-6 flex space-x-4 items-start">
          <div>
            <h5 className="text-3xl font-semibold">Cài đặt</h5>
            <div className="flex mt-4 space-x-6 items-center">
              { groupSettings.map(v =>
                <div key={v.id} 
                  className={`py-2 capitalize hover:text-blue-500 cursor-pointer 
                    ${v.id == groupActive?.id ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                  onClick={() => setGroupActive(v)}
                >{v.label}</div>
              )}
            </div>
          </div>
          <div className="!ml-auto"></div>
          <Button variant='contained' color='info' disabled={!canEdit} startIcon={<span className="icon">sync</span>}
            onClick={() => setOpenUpdateSettingModal(true)}
          >
            Cập nhập cài đặt
          </Button>
        </div>
        <div className="flex-grow min-h-0 -mx-8 p-8">
          <form className="grid grid-cols-12 bg-white rounded-lg p-8 gap-6" onSubmit={handelSubmit}>
            { settings.length > 0 
              ? <>
                { settings.map(v => {
                  const Component = DATA_FIELDS[v.type] ? DATA_FIELDS[v.type].Component : null
                  return Component ? <div key={v.id} style={{gridColumn: `span ${v.col || 6} / span ${v.col || 6}`}}>
                    <Component
                      label={v.label} name={v.name}
                      required={false} 
                      // defaultValue={v.value}
                      value={listDataValue.find(v2 => v2.name == v.name)?.value}
                      onChange={(v2) => onChangeValue(v2, v.name)}
                      details={{...v.details, tableName: 'setting'}}
                    />
                  </div> : null
                })}
                <div className="col-span-12">
                  <Button type='submit' className='float-right' disabled={!canEdit} variant='contained' startIcon={<span className="icon">save</span>}>
                    Lưu cài đặt
                  </Button>
                </div>
              </>
              : <p className='col-span-12'>Không có cài đặt nào</p>
            }
          </form>
        </div>
      </div>

      <UpdateSettingsPopup open={openUpdateSettingModal} setOpen={setOpenUpdateSettingModal} createEditSetting={createEditSetting} />
    </>
  )
}

const UpdateSettingsPopup = ({
  open, setOpen, createEditSetting
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  createEditSetting: () => Promise<void>
}) => {

  const router = useRouter()

  const handelDelete = async () => {

    await promiseFunction({
      callback: async () => {
        await createEditSetting()
        
        router.refresh()
        setOpen(false)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
    >
      <DialogTitle>Cập nhập cài đặt</DialogTitle>
      <DialogContent>
        Bạn có  muốn cập nhập lại cài đặt không ?
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Hủy</Button>
        <Button variant='contained' onClick={handelDelete}>Tiếp tục</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingContentAdmin
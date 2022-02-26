import { Dialog } from '@headlessui/react';
import styled from './style.module.scss';

const Modal = ({ title, description, loading = false }) => {
  return (
    <Dialog
      open
      onClose={() => {}}
      className='fixed inset-0 z-10 overflow-y-auto'
    >
      <div className='flex items-center justify-center min-h-screen'>
        <Dialog.Overlay className='fixed inset-0 bg-black opacity-40' />

        <div className='relative bg-white rounded-lg max-w-xl mx-auto w-[800px] px-6 py-4'>
          <Dialog.Title className='mb-4 text-xl font-semibold text-gray-700'>
            {title}
          </Dialog.Title>
          {loading && (
            <div className='w-full mb-2'>
              <div className={styled.progress}>
                <span className={`${styled['progress-bar']} w-3/4`} />
              </div>
            </div>
          )}
          <Dialog.Description as='div' className='text-gray-700'>
            {description}
          </Dialog.Description>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;
